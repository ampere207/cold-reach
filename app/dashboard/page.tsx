'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { useSyncUser } from '@/lib/syncUser'
import { createSupabaseBrowserClient } from '@/lib/supabase'

export default function DashboardPage() {
  useSyncUser()
  const { user } = useUser()
  const supabase = createSupabaseBrowserClient()

  const [totalLeads, setTotalLeads] = useState<number | null>(null)
  const [totalCampaigns, setTotalCampaigns] = useState<number | null>(null)
  const [weeklyTemplates, setWeeklyTemplates] = useState<number | null>(null)


  useEffect(() => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const fetchStats = async () => {
      
      if (!user) return

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      if (userError || !userData?.id) {
        console.error('User UUID fetch error:', userError?.message)
        return
      }

      const userUuid = userData.id

      const { count: leadsCount } = await supabase
        .from('templates')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userUuid)

      const { count: weeklyTemplatesCount } = await supabase
        .from('templates')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userUuid)
        .gte('created_at', oneWeekAgo.toISOString())

      const { count: campaignCount } = await supabase
        .from('campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userUuid)

      setTotalLeads(leadsCount ?? 0)
      setTotalCampaigns(campaignCount ?? 0)
      setWeeklyTemplates(weeklyTemplatesCount ?? 0)
    }

    fetchStats()
  }, [user])

  return (
    <div>
      <h2 className="text-4xl font-bold mb-4">Welcome back 👋</h2>
      <p className="text-[#475569] mb-10">
        Here's an overview of your outreach performance.
      </p>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="backdrop-blur-lg bg-white/40 border border-white/30 shadow-md">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-2 text-[#1E293B]">Total Leads</h3>
            <p className="text-4xl font-bold text-[#38b2ac]">
              {totalLeads !== null ? totalLeads : '...'}
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg bg-white/40 border border-white/30 shadow-md">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-2 text-[#1E293B]">Total Campaigns</h3>
            <p className="text-4xl font-bold text-[#38b2ac]">
              {totalCampaigns !== null ? totalCampaigns : '...'}
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg bg-white/40 border border-white/30 shadow-md">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-2 text-[#1E293B]">Templates Generated This Week</h3>
            <p className="text-4xl font-bold text-[#38b2ac]">{weeklyTemplates !== null ? weeklyTemplates : '...'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <div className="text-center mt-10">
        <h3 className="text-2xl font-semibold mb-4">
          Ready to launch your next campaign?
        </h3>
        <Link href="/dashboard/campaigns">
          <Button className="bg-[#38b2ac] text-white px-6 py-4 text-lg hover:bg-[#2c9c96]">
            Start a Campaign →
          </Button>
        </Link>
      </div>
    </div>
  )
}
