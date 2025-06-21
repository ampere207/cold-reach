// app/dashboard/settings/page.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export default function SettingsPage() {
  const [senderEmail, setSenderEmail] = useState('you@example.com')
  const [senderName, setSenderName] = useState('ColdReach Team')
  const [trackingEnabled, setTrackingEnabled] = useState(true)

  const saveSettings = () => {
    alert('Settings saved!')
  }

  return (
    <div>
      <h2 className="text-4xl font-bold mb-6">Settings</h2>

      <Card className="bg-white/40 backdrop-blur-lg border border-white/30 shadow-md">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="senderName">Sender Name</Label>
            <Input
              id="senderName"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Your name or company"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="senderEmail">Sender Email</Label>
            <Input
              id="senderEmail"
              type="email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Enable Open & Click Tracking</Label>
            <Switch checked={trackingEnabled} onCheckedChange={setTrackingEnabled} />
          </div>

          <Button
            onClick={saveSettings}
            className="bg-[#38b2ac] text-white hover:bg-[#2c9c96]"
          >
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
