'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { useUser } from '@clerk/nextjs'
import { Skeleton } from '@/components/ui/skeleton'

interface TemplateRow {
  id: string
  motive: string
  content: string
  recipient_name: string
  created_at: string
  campaign_selected?: string | null
  scraped_data?: any
}

interface CampaignMap {
  [key: string]: string // campaign_id -> campaign_name
}

export default function LeadsPage() {
  const [templates, setTemplates] = useState<TemplateRow[]>([])
  const [campaignMap, setCampaignMap] = useState<CampaignMap>({})
  const [userUuid, setUserUuid] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const { user } = useUser()
  const supabase = createSupabaseBrowserClient()

  // 🔗 Map Clerk ID to Supabase UUID
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

  // 📦 Fetch templates and campaign names
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

      const campaignMap: CampaignMap = {}
      if (campaignRes.data) {
        campaignRes.data.forEach((c) => {
          campaignMap[c.id] = c.name
        })
        setCampaignMap(campaignMap)
      }

      setTemplates(templateRes.data || [])
      setLoading(false)
    }

    fetchData()
  }, [userUuid])

  return (
    <div>
      <h2 className="text-4xl font-bold mb-6">Lead History</h2>

      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Card key={idx} className="bg-white/30 backdrop-blur-md border border-white/20 shadow-sm">
              <CardContent className="p-6 space-y-4 animate-pulse">
                <Skeleton className="h-4 w-32 bg-gray-300/40 rounded" />
                <Skeleton className="h-6 w-1/2 bg-gray-300/40 rounded" />
                <Skeleton className="h-4 w-1/3 bg-gray-300/40 rounded" />
                <Skeleton className="h-24 w-full bg-gray-300/30 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <p className="text-gray-600">No leads generated yet.</p>
      ) : (
        <div className="space-y-6">
          {templates.map((template) => {
            const campaignName = template.campaign_selected
              ? campaignMap[template.campaign_selected] || 'Unknown Campaign'
              : 'None'

            return (
              <Card
                key={template.id}
                className="bg-white/40 backdrop-blur-lg border border-white/30 shadow-md"
              >
                <CardContent className="p-6 space-y-3">
                  <div className="text-sm text-gray-600">
                    {new Date(template.created_at).toLocaleString()}
                  </div>
                  <div className="font-semibold text-lg">
                    To: {template.recipient_name}
                  </div>
                  <div className="text-sm text-[#555] italic">
                    Motive: {template.motive}
                  </div>
                  <div className="text-sm text-[#333]">
                    <span className="font-semibold">Campaign:</span>{' '}
                    {campaignName}
                  </div>
                  <pre className="whitespace-pre-wrap text-sm bg-white/30 p-3 rounded-lg border border-white/20">
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
