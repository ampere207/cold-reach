'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useUser } from '@clerk/nextjs'
import { createSupabaseBrowserClient } from '@/lib/supabase'

export default function SettingsPage() {
  const [senderEmail, setSenderEmail] = useState('')
  const [senderName, setSenderName] = useState('')
  const [trackingEnabled, setTrackingEnabled] = useState(true)
  const [userUuid, setUserUuid] = useState<string | null>(null)

  const { user } = useUser()
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    const mapClerkToSupabaseUser = async () => {
      if (!user) return

      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      if (data?.id) setUserUuid(data.id)
      else console.error('Supabase user not found for Clerk ID:', error?.message)
    }

    mapClerkToSupabaseUser()
  }, [user])

  useEffect(() => {
    const loadSettings = async () => {
      if (!userUuid) return

      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', userUuid)
        .single()

      if (data) {
        setSenderEmail(data.sender_email || '')
        setSenderName(data.sender_name || '')
        setTrackingEnabled(data.tracking_enabled)
      } else if (error) {
        console.warn('No settings found or failed to fetch:', error.message)
      }
    }

    loadSettings()
  }, [userUuid])

  const saveSettings = async () => {
    if (!userUuid) return

    const { error } = await supabase.from('settings').upsert(
      {
        user_id: userUuid,
        sender_email: senderEmail,
        sender_name: senderName,
        tracking_enabled: trackingEnabled,
      },
      { onConflict: 'user_id' }
    )

    if (error) {
      console.error('[Supabase Save Error]', error.message, error.details)
      alert(`Failed to save settings: ${error.message}`)
    } else {
      alert('✅ Settings saved successfully!')
    }
  }

  return (
    <div className="py-8">
      <h2 className="text-4xl font-bold text-center mb-10">⚙️ Settings</h2>

      <Card className="bg-white/30 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl">
        <CardContent className="p-8 space-y-6">
          <div className="space-y-2">
            <Label className="text-base text-gray-800 font-medium" htmlFor="senderName">
              Sender Name
            </Label>
            <Input
              id="senderName"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="e.g., John Doe or ColdReach.io"
              className="bg-white/60 backdrop-blur-md"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base text-gray-800 font-medium" htmlFor="senderEmail">
              Sender Email
            </Label>
            <Input
              id="senderEmail"
              type="email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              placeholder="you@example.com"
              className="bg-white/60 backdrop-blur-md"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-base text-gray-800 font-medium">
              Enable Open & Click Tracking
            </Label>
            <Switch
              checked={trackingEnabled}
              onCheckedChange={setTrackingEnabled}
            />
          </div>
          <div className='flex justify-center'>
          <Button
            onClick={saveSettings}
            className="bg-[#38b2ac] hover:bg-[#2c9c96] text-white px-6 py-2 text-base font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
          >
            Save Settings
          </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
