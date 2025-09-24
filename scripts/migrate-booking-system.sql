-- Migration script to add booking system support
-- This script adds new tables and modifies existing ones to support the booking functionality

-- Create pricing_type enum
CREATE TYPE pricing_type AS ENUM ('fixed', 'weekday_weekend', 'seasonal');

-- Create booking_status enum  
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Create property_pricing table
CREATE TABLE property_pricing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pricing_type pricing_type NOT NULL DEFAULT 'fixed',
    base_rate DECIMAL(10,2) NOT NULL,
    weekday_rate DECIMAL(10,2),
    weekend_rate DECIMAL(10,2),
    seasonal_rates JSONB,
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    guest_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255),
    guest_phone VARCHAR(50),
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    nights INTEGER NOT NULL,
    guests INTEGER NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    custom_rate DECIMAL(10,2),
    status booking_status DEFAULT 'pending',
    booking_source VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_dates CHECK (check_out_date > check_in_date),
    CONSTRAINT check_nights CHECK (nights > 0),
    CONSTRAINT check_guests CHECK (guests > 0),
    CONSTRAINT check_amount CHECK (total_amount >= 0)
);

-- Add booking_id column to transactions table
ALTER TABLE transactions ADD COLUMN booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX idx_property_pricing_property_id ON property_pricing(property_id);
CREATE INDEX idx_property_pricing_user_id ON property_pricing(user_id);
CREATE INDEX idx_property_pricing_active ON property_pricing(is_active);

CREATE INDEX idx_bookings_property_id ON bookings(property_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX idx_bookings_status ON bookings(status);

CREATE INDEX idx_transactions_booking_id ON transactions(booking_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_property_pricing_updated_at BEFORE UPDATE ON property_pricing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE property_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for property_pricing
CREATE POLICY "Users can view their own property pricing" ON property_pricing
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own property pricing" ON property_pricing
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own property pricing" ON property_pricing
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own property pricing" ON property_pricing
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for bookings
CREATE POLICY "Users can view their own bookings" ON bookings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" ON bookings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookings" ON bookings
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically calculate nights
CREATE OR REPLACE FUNCTION calculate_nights()
RETURNS TRIGGER AS $$
BEGIN
    NEW.nights = NEW.check_out_date - NEW.check_in_date;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to automatically calculate nights
CREATE TRIGGER calculate_booking_nights 
    BEFORE INSERT OR UPDATE ON bookings 
    FOR EACH ROW EXECUTE FUNCTION calculate_nights();

-- Create function to automatically create income transaction for confirmed bookings
CREATE OR REPLACE FUNCTION create_booking_income()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create income transaction when booking is confirmed
    IF NEW.status = 'confirmed' AND (OLD IS NULL OR OLD.status != 'confirmed') THEN
        INSERT INTO transactions (
            property_id,
            user_id,
            booking_id,
            type,
            category,
            amount,
            description,
            date
        ) VALUES (
            NEW.property_id,
            NEW.user_id,
            NEW.id,
            'income',
            'Booking Revenue',
            NEW.total_amount,
            'Booking income for ' || NEW.guest_name || ' (' || NEW.check_in_date || ' to ' || NEW.check_out_date || ')',
            NEW.check_in_date
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to create income transaction for confirmed bookings
CREATE TRIGGER create_booking_income_trigger
    AFTER INSERT OR UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION create_booking_income();
