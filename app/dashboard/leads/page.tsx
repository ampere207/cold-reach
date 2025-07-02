'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { useUser } from '@clerk/nextjs'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { ChevronDownIcon } from 'lucide-react'

interface TemplateRow {
  id: string
  motive: string
  content: string
  recipient_name: string
  created_at: string
  campaign_selected?: string | null
  scraped_data?: string | null
}

interface Campaign {
  id: string
  name: string
}

interface CampaignMap {
  [key: string]: string
}

export default function LeadsPage() {
  const [templates, setTemplates] = useState<TemplateRow[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<TemplateRow[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [campaignMap, setCampaignMap] = useState<CampaignMap>({})
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('all')
  const [userUuid, setUserUuid] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

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
      else console.error('Supabase user not found:', error?.message)
    }

    mapClerkToSupabaseUser()
  }, [user])

  useEffect(() => {
    const fetchData = async () => {
      if (!userUuid) return
      setLoading(true)

      const [templateRes, campaignRes] = await Promise.all([
        supabase
          .from('templates')
          .select('*')
          .eq('user_id', userUuid)
          .order('created_at', { ascending: false }),
        supabase
          .from('campaigns')
          .select('id, name')
          .eq('user_id', userUuid),
      ])

      if (templateRes.error) console.error('Template fetch error:', templateRes.error.message)
      if (campaignRes.error) console.error('Campaign fetch error:', campaignRes.error.message)

      const map: CampaignMap = {}
      if (campaignRes.data) {
        campaignRes.data.forEach((c) => {
          map[c.id] = c.name
        })
        setCampaigns(campaignRes.data)
        setCampaignMap(map)
      }

      const templates = templateRes.data || []
      setTemplates(templates)
      setFilteredTemplates(templates)
      setLoading(false)
    }

    fetchData()
  }, [userUuid])

  useEffect(() => {
    if (selectedCampaignId === 'all') {
      setFilteredTemplates(templates)
    } else {
      const filtered = templates.filter(
        (t) => t.campaign_selected === selectedCampaignId
      )
      setFilteredTemplates(filtered)
    }
  }, [selectedCampaignId, templates])

  return (
    <div className='py-8'>
      <h2 className="text-4xl font-bold mb-8 text-center">📬 Lead History</h2>

      {/* Filter Dropdown */}
      <div className="mb-8">
        <Label className="mb-2 block text-md font-semibold text-gray-700">
          🎯 Filter by Campaign
        </Label>
        <div className="relative">
          <select
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            className={cn(
              'w-full p-3 rounded-lg bg-white/60 backdrop-blur-md border text-md appearance-none',
              'pr-10 border-white/30 focus:outline-none shadow-sm'
            )}
          >
            <option value="all">All Campaigns</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 pointer-events-none" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Card
              key={idx}
              className="bg-white/30 backdrop-blur-md border border-white/20 shadow-md rounded-xl"
            >
              <CardContent className="p-6 space-y-4 animate-pulse">
                <Skeleton className="h-4 w-32 bg-gray-300/40 rounded" />
                <Skeleton className="h-6 w-1/2 bg-gray-300/40 rounded" />
                <Skeleton className="h-4 w-1/3 bg-gray-300/40 rounded" />
                <Skeleton className="h-24 w-full bg-gray-300/30 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <p className="text-gray-500 text-center">No leads found for this campaign.</p>
      ) : (
        <div className="space-y-6">
          {filteredTemplates.map((template) => {
            const campaignName = template.campaign_selected
              ? campaignMap[template.campaign_selected] || 'Unknown Campaign'
              : 'None'

            return (
              <Card
                key={template.id}
                className="bg-white/50 backdrop-blur-lg border border-white/20 shadow-xl rounded-xl hover:shadow-2xl transition duration-300"
              >
                <CardContent className="p-6 space-y-3">
                  <div className="text-sm text-gray-500 tracking-wide">
                    {new Date(template.created_at).toLocaleString()}
                  </div>
                  <div className="text-lg font-bold text-[#333]">
                    📨 To: <span className="text-[#111]">{template.recipient_name}</span>
                  </div>
                  <div className="text-md text-gray-900 italic">
                    🎯 Motive: <span className="text-gray-900">{template.motive}</span>
                  </div>
                  <div className="text-md text-gray-700">
                    🧩 Campaign: <span className="font-medium">{campaignName}</span>
                  </div>
                  <pre className="whitespace-pre-wrap text-md bg-white/40 p-4 rounded-xl border border-white/20 font-mono text-gray-800">
                    {template.content}
                  </pre>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
