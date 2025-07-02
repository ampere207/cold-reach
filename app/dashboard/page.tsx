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
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

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
    <div className="animate-fade-in">
      <h2 className="text-4xl font-bold mb-4 text-gray-900">Welcome back 👋</h2>
      <p className="text-gray-600 mb-10 text-lg">
        Here&apos;s an overview of your outreach performance.
      </p>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {[ 
          {
            label: 'Total Leads',
            value: totalLeads,
            color: 'text-[#38b2ac]'
          },
          {
            label: 'Total Campaigns',
            value: totalCampaigns,
            color: 'text-[#4c51bf]'
          },
          {
            label: 'Templates Generated This Week',
            value: weeklyTemplates,
            color: 'text-[#f6ad55]'
          }
        ].map((stat, idx) => (
          <Card
            key={idx}
            className="bg-white/40 backdrop-blur-xl border border-white/20 shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 rounded-2xl"
          >
            <CardContent className="p-6 space-y-2">
              <h3 className="text-xl font-semibold text-gray-800">
                {stat.label}
              </h3>
              <p className={`text-5xl font-bold ${stat.color}`}>
                {stat.value !== null ? stat.value : '...'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA Section */}
      <div className="text-center mt-10">
        <h3 className="text-2xl font-semibold mb-4 text-gray-800">
          🚀 Ready to launch your next campaign?
        </h3>
        <Link href="/dashboard/campaigns">
          <Button className="bg-[#38b2ac] text-white px-6 py-4 text-lg hover:bg-[#2c9c96] transition-all shadow-lg hover:scale-105 rounded-xl">
            Start a Campaign →
          </Button>
        </Link>
      </div>
    </div>
  )
}
