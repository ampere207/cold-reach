// app/dashboard/page.tsx
'use client'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSyncUser } from "@/lib/syncUser"

export default function DashboardPage() {
  useSyncUser()
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
            <p className="text-4xl font-bold text-[#38b2ac]">432</p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg bg-white/40 border border-white/30 shadow-md">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-2 text-[#1E293B]">Campaigns Sent</h3>
            <p className="text-4xl font-bold text-[#38b2ac]">9</p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg bg-white/40 border border-white/30 shadow-md">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-2 text-[#1E293B]">Avg. Reply Rate</h3>
            <p className="text-4xl font-bold text-[#38b2ac]">17.4%</p>
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
