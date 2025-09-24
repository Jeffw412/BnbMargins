-- Enhanced pricing system migration
-- This script enhances the pricing system to support both seasonal AND weekday/weekend rates

-- Update pricing_type enum to include enhanced seasonal option
ALTER TYPE pricing_type ADD VALUE IF NOT EXISTS 'seasonal_weekday_weekend';

-- Add new columns to property_pricing table for enhanced seasonal pricing
ALTER TABLE property_pricing
ADD COLUMN IF NOT EXISTS seasonal_weekday_rates JSONB,
ADD COLUMN IF NOT EXISTS seasonal_weekend_rates JSONB,
ADD COLUMN IF NOT EXISTS default_season_name VARCHAR(100) DEFAULT 'Regular Season';

-- Update the property_pricing table comment
COMMENT ON TABLE property_pricing IS 'Enhanced pricing system supporting multiple pricing strategies:
- fixed: Single rate for all days
- weekday_weekend: Different rates for weekdays vs weekends
- seasonal: Different rates by season (uses seasonal_rates JSONB)
- seasonal_weekday_weekend: Seasonal rates with weekday/weekend differentiation';

-- Example seasonal_weekday_rates structure:
-- {
--   "high_season": {
--     "name": "High Season",
--     "start_date": "2024-06-01",
--     "end_date": "2024-08-31",
--     "weekday_rate": 180.00,
--     "weekend_rate": 220.00
--   },
--   "low_season": {
--     "name": "Low Season",
--     "start_date": "2024-11-01",
--     "end_date": "2024-03-31",
--     "weekday_rate": 120.00,
--     "weekend_rate": 150.00
--   }
-- }

-- Add booking cancellation support
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS cancellation_fee DECIMAL(10,2) DEFAULT 0;

-- Create function to cancel booking
CREATE OR REPLACE FUNCTION cancel_booking(
    p_booking_id UUID,
    p_cancellation_reason TEXT DEFAULT NULL,
    p_refund_amount DECIMAL(10,2) DEFAULT NULL,
    p_cancellation_fee DECIMAL(10,2) DEFAULT 0
) RETURNS BOOLEAN AS $$
DECLARE
    booking_record RECORD;
    calculated_refund DECIMAL(10,2);
BEGIN
    -- Get booking information
    SELECT * INTO booking_record
    FROM bookings
    WHERE id = p_booking_id AND status != 'cancelled';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Booking not found or already cancelled';
    END IF;

    -- Calculate refund amount if not provided
    IF p_refund_amount IS NULL THEN
        -- Default: full refund minus cancellation fee
        calculated_refund := booking_record.total_amount - p_cancellation_fee;
    ELSE
        calculated_refund := p_refund_amount;
    END IF;

    -- Update booking status
    UPDATE bookings SET
        status = 'cancelled',
        cancelled_at = NOW(),
        cancellation_reason = p_cancellation_reason,
        refund_amount = calculated_refund,
        cancellation_fee = p_cancellation_fee,
        updated_at = NOW()
    WHERE id = p_booking_id;

    -- Create refund transaction if refund amount > 0
    IF calculated_refund > 0 THEN
        INSERT INTO transactions (
            user_id,
            property_id,
            booking_id,
            type,
            amount,
            description,
            category_id,
            transaction_date
        ) VALUES (
            booking_record.user_id,
            booking_record.property_id,
            booking_record.id,
            'expense',
            calculated_refund,
            'Booking cancellation refund for ' || booking_record.guest_name,
            (SELECT id FROM categories WHERE user_id = booking_record.user_id AND name = 'Refunds' LIMIT 1),
            CURRENT_DATE
        );
    END IF;

    -- Create cancellation fee transaction if fee > 0
    IF p_cancellation_fee > 0 THEN
        INSERT INTO transactions (
            user_id,
            property_id,
            booking_id,
            type,
            amount,
            description,
            category_id,
            transaction_date
        ) VALUES (
            booking_record.user_id,
            booking_record.property_id,
            booking_record.id,
            'income',
            p_cancellation_fee,
            'Cancellation fee for ' || booking_record.guest_name,
            (SELECT id FROM categories WHERE user_id = booking_record.user_id AND name = 'Fees' LIMIT 1),
            CURRENT_DATE
        );
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_bookings_property_dates ON bookings(property_id, check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_property_pricing_active ON property_pricing(property_id, is_active);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION cancel_booking(UUID, TEXT, DECIMAL, DECIMAL) TO authenticated;