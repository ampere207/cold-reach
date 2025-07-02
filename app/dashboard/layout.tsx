// app/dashboard/layout.tsx
'use client'
import { ReactNode } from "react"
import Link from "next/link"
import { UserButton } from "@clerk/nextjs"
import {
  LayoutDashboard,
  Users,
  //Mail,
  Settings,
  Sparkles,
  Send,
} from "lucide-react"
import { useSyncUser } from "@/lib/syncUser"

const navLinks = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/campaigns", icon: Send, label: "Campaigns" },
  { href: "/dashboard/templates", icon: Sparkles, label: "Generate Text" },
  { href: "/dashboard/leads", icon: Users, label: "Leads" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  useSyncUser()
  return (
    <div className="flex min-h-screen text-[#1E293B]">
      {/* Sidebar */}
      <aside className="w-64 backdrop-blur-lg bg-white/40 border-r border-white/30 p-6 flex flex-col justify-between shadow-lg">
        <div>
          <h1 className="text-2xl font-bold mb-8">
            Cold<span className="text-[#38b2ac]">Reach</span>
          </h1>
          <nav className="space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-[#B8FFF2]/30 transition"
              >
                <link.icon size={20} className="text-[#38b2ac]" />
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-10">
          <UserButton afterSignOutUrl="/" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-gradient-to-br from-white via-[#B8FFF2] to-[#A0E7E5] relative overflow-y-auto">
        {/* Background visuals */}
        <div className="absolute w-80 h-80 bg-[#E3DFFF] rounded-full blur-3xl opacity-30 -top-20 -left-20 z-0" />
        <div className="absolute w-60 h-60 bg-[#A0E7E5] rounded-full blur-2xl opacity-20 bottom-10 right-10 z-0" />
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  )
}
