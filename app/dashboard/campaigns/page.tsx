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
  status?: 'ongoing' | 'halted' | 'completed' | null
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
  <div className="w-full px-4 sm:px-10 py-8">
    <h2 className="text-4xl font-bold mb-8 text-center text-[#1f2937]">
      📣 Campaign Manager
    </h2>

    {/* Launch Campaign Card */}
    <Card className="bg-white/30 backdrop-blur-lg border border-white/20 shadow-lg rounded-2xl mb-10">
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
          <Label className="text-base text-gray-800">Campaign Name</Label>
          <Input
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="e.g., Fintech Founders Outreach"
            className="bg-white/60 backdrop-blur-sm border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-base text-gray-800 font-medium">Target Audience</Label>
          <Textarea
            rows={3}
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="e.g., Founders of B2B SaaS companies in India"
            className="bg-white/60 backdrop-blur-sm border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handleLaunch}
            disabled={launching}
            className="bg-[#38b2ac] hover:bg-[#2c9c96] text-white px-6 py-2 text-base font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
          >
            {launching ? (
              <>
                <Loader2 className="animate-spin mr-2 h-5 w-5" /> Launching...
              </>
            ) : (
              'Launch Campaign 🚀'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>

    {/* Campaign History */}
    <h3 className="text-2xl font-semibold mb-4 text-[#1f2937]">📜 Campaign History</h3>

    {loading ? (
      <div className="text-gray-500 text-center">Loading campaigns...</div>
    ) : campaigns.length === 0 ? (
      <p className="text-gray-500 text-center">No campaigns launched yet.</p>
    ) : (
      <div className="space-y-4">
        {campaigns.map((c) => (
          <Card
            key={c.id}
            className="bg-white/30 backdrop-blur-lg border border-white/20 shadow-md rounded-2xl hover:shadow-lg transition-shadow"
          >
            <CardContent className="p-5 space-y-3">
              <div className="flex justify-between items-center">
                <div className="font-semibold text-lg text-gray-800">{c.name}</div>

                <select
                  value={c.status ?? ''}
                  onChange={async (e) => {
                    const newStatus = e.target.value as Campaign['status']
                    const { error } = await supabase
                      .from('campaigns')
                      .update({ status: newStatus })
                      .eq('id', c.id)

                    if (!error) {
                      setCampaigns((prev) =>
                        prev.map((camp) =>
                          camp.id === c.id ? { ...camp, status: newStatus } : camp
                        )
                      )
                    } else {
                      console.error('Update status error:', error.message)
                      alert('Failed to update status')
                    }
                  }}
                  className="text-sm px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#38b2ac]"
                >
                  <option value="">Set Status</option>
                  <option value="ongoing">🟢 Ongoing</option>
                  <option value="halted">🟠 Halted</option>
                  <option value="completed">🔵 Completed</option>
                </select>
              </div>

              <div className="text-sm text-gray-700 italic">
                🎯 {c.audience_description}
              </div>

              <div className="text-sm text-gray-500">
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
