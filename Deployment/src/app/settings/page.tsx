"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useSettings } from "@/contexts/settings-context"
import { getAirbnbFeeRate } from "@/lib/utils"

export default function SettingsPage() {
  const { airbnbFeeModel, setAirbnbFeeModel, currency, setCurrency } = useSettings()

  const handleFeeModelChange = (checked: boolean) => {
    setAirbnbFeeModel(checked ? 'host-only' : 'split')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application preferences
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Airbnb Fee Model</CardTitle>
            <CardDescription>
              Choose how Airbnb service fees are calculated for your properties
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="fee-model">Host-Only Fee Model</Label>
                <p className="text-sm text-muted-foreground">
                  {airbnbFeeModel === 'split'
                    ? 'Currently using Split Fee Model (3% of booking + cleaning fees)'
                    : 'Currently using Host-Only Fee Model (14% of booking + cleaning fees)'
                  }
                </p>
              </div>
              <Switch
                id="fee-model"
                checked={airbnbFeeModel === 'host-only'}
                onCheckedChange={handleFeeModelChange}
              />
            </div>

            <div className="rounded-lg bg-muted p-4">
              <h4 className="font-medium mb-2">Fee Model Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Split Fee Model:</span>
                  <span>3% (shared between host and guest)</span>
                </div>
                <div className="flex justify-between">
                  <span>Host-Only Fee Model:</span>
                  <span>14% (paid entirely by host)</span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Current Rate:</span>
                  <span>{(getAirbnbFeeRate(airbnbFeeModel) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Currency Settings</CardTitle>
            <CardDescription>
              Set your preferred currency for displaying amounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="currency">Default Currency</Label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                </select>
              </div>
              <p className="text-sm text-muted-foreground">
                Currently displaying amounts in {currency}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
