'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { useUser } from '@clerk/nextjs'
import { Loader2 } from 'lucide-react'

interface Campaign {
  id: string
  name: string
  audience_description: string
  created_at: string
}

export default function CampaignsPage() {
  const [campaignName, setCampaignName] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [launching, setLaunching] = useState(false)
  const [userUuid, setUserUuid] = useState<string | null>(null)

  const { user } = useUser()
  const supabase = createSupabaseBrowserClient()

  // 🔁 Map Clerk ID to Supabase UUID
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

  // 📥 Fetch campaign history
  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!userUuid) return
      setLoading(true)

      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', userUuid)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setCampaigns(data)
      } else {
        console.error('[Fetch Campaigns Error]', error?.message)
      }

      setLoading(false)
    }

    fetchCampaigns()
  }, [userUuid])

  // 🚀 Launch new campaign
  const handleLaunch = async () => {
    if (!userUuid) return alert('You must be logged in.')
    if (!campaignName.trim() || !targetAudience.trim()) {
      return alert('Please enter campaign name and audience.')
    }

    setLaunching(true)

    const { error } = await supabase.from('campaigns').insert({
      user_id: userUuid,
      name: campaignName,
      audience_description: targetAudience,
    })

    if (error) {
      console.error('[Launch Campaign Error]', error.message)
      alert('Failed to launch campaign.')
    } else {
      alert(`✅ Campaign "${campaignName}" launched!`)
      setCampaignName('')
      setTargetAudience('')
      // Refresh campaign list
      const { data } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', userUuid)
        .order('created_at', { ascending: false })

      setCampaigns(data || [])
    }

    setLaunching(false)
  }

  return (
    <div>
      <h2 className="text-4xl font-bold mb-6">📣 Campaigns</h2>

      <Card className="bg-white/40 backdrop-blur-lg border border-white/30 shadow-md mb-10">
        <CardContent className="p-6 space-y-4">
          <div>
            <Label>Campaign Name</Label>
            <Input
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="e.g., Fintech Founders Outreach"
            />
          </div>

          <div>
            <Label>Target Audience Description</Label>
            <Textarea
              rows={3}
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g., Founders of B2B SaaS companies in India"
            />
          </div>

          <Button
            onClick={handleLaunch}
            className="bg-[#38b2ac] text-white hover:bg-[#2c9c96]"
            disabled={launching}
          >
            {launching ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" /> Launching...
              </>
            ) : (
              'Launch Campaign 🚀'
            )}
          </Button>
        </CardContent>
      </Card>

      <h3 className="text-2xl font-semibold mb-4">📜 Campaign History</h3>

      {loading ? (
        <div className="text-gray-600">Loading campaigns...</div>
      ) : campaigns.length === 0 ? (
        <p className="text-gray-600">No campaigns launched yet.</p>
      ) : (
        <div className="space-y-4">
          {campaigns.map((c) => (
            <Card
              key={c.id}
              className="bg-white/40 backdrop-blur-lg border border-white/30 shadow-md"
            >
              <CardContent className="p-5 space-y-2">
                <div className="font-semibold text-lg">{c.name}</div>
                <div className="text-sm italic text-[#444]">
                  {c.audience_description}
                </div>
                <div className="text-sm text-gray-600">
                  Created: {new Date(c.created_at).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
