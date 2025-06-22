'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { useUser } from '@clerk/nextjs'

export default function CampaignsPage() {
  const [campaignName, setCampaignName] = useState('')
  const [selectedSequence, setSelectedSequence] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [sequences, setSequences] = useState<any[]>([])

  const [userUuid, setUserUuid] = useState<string | null>(null)

  const { user } = useUser()
  const supabase = createSupabaseBrowserClient()

  // 🧠 Map Clerk ID to Supabase UUID
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

  // 📨 Fetch sequences belonging to user
  useEffect(() => {
    const fetchSequences = async () => {
      if (!userUuid) return

      const { data, error } = await supabase
        .from('sequences')
        .select('id, name')
        .eq('user_id', userUuid)

      if (!error && data) {
        setSequences(data)
      } else if (error) {
        console.error('[Fetch Sequences Error]', error.message)
      }
    }

    fetchSequences()
  }, [userUuid])

  // 🚀 Launch Campaign
  const handleLaunch = async () => {
    if (!userUuid) return alert('You must be logged in.')
    if (!selectedSequence) return alert('Please select a sequence.')

    const { error } = await supabase.from('campaigns').insert({
      user_id: userUuid,
      name: campaignName,
      sequence_id: selectedSequence,
      audience_description: targetAudience,
    })

    if (error) {
      console.error('[Launch Campaign Error]', error.message)
      alert('Failed to launch campaign.')
    } else {
      alert(`Campaign "${campaignName}" launched successfully!`)
      setCampaignName('')
      setSelectedSequence('')
      setTargetAudience('')
    }
  }

  return (
    <div>
      <h2 className="text-4xl font-bold mb-6">Launch Campaign</h2>

      <Card className="bg-white/40 backdrop-blur-lg border border-white/30 shadow-md">
        <CardContent className="p-6 space-y-4">
          <div>
            <Label>Campaign Name</Label>
            <Input
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="e.g., SaaS Founders Outreach"
            />
          </div>

          <div>
            <Label>Select Email Sequence</Label>
            <select
              className="w-full p-2 rounded-md border bg-white/70 text-sm"
              value={selectedSequence}
              onChange={(e) => setSelectedSequence(e.target.value)}
            >
              <option value="">-- Select a Sequence --</option>
              {sequences.map((seq) => (
                <option key={seq.id} value={seq.id}>
                  {seq.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Target Audience Description</Label>
            <Textarea
              rows={4}
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g., Startup founders on LinkedIn in FinTech"
            />
          </div>

          <Button
            onClick={handleLaunch}
            className="bg-[#38b2ac] text-white hover:bg-[#2c9c96]"
          >
            Launch Campaign 🚀
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
