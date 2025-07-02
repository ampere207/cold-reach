'use client'

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { ReactNode } from 'react'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

// ... your imports stay the same
import {
  Sparkles,
  Settings2,
  BarChart,
  Send,
  Users,
  Brain,
  TrendingUp,
} from 'lucide-react'
import { useSyncUser } from '@/lib/syncUser'

export default function Home() {
  useSyncUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#B8FFF2] to-[#A0E7E5] text-[#1E293B] relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute w-[400px] h-[400px] bg-[#E3DFFF] rounded-full blur-[150px] opacity-30 -top-10 -left-10 animate-pulse"></div>
      <div className="absolute w-[300px] h-[300px] bg-[#A0E7E5] rounded-full blur-[120px] opacity-20 bottom-0 right-0 animate-ping"></div>

      {/* Navbar */}
      <nav className="sticky top-0 z-20 backdrop-blur-lg bg-white/30 border-b border-white/20 shadow-sm">
        <div className="px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            Cold<span className="text-[#38b2ac]">Reach</span>
          </h1>
          <SignedOut>
            <div className="flex gap-4">
              <SignInButton mode="modal">
                <Button variant="outline" className="border-[#38b2ac] text-[#38b2ac] hover:bg-[#38b2ac]/10 transition-colors">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="bg-[#38b2ac] text-white hover:bg-[#2c9c96] transition-colors shadow-md">
                  Sign Up
                </Button>
              </SignUpButton>
            </div>
          </SignedOut>
          <SignedIn>
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button className="bg-[#38b2ac] text-white hover:bg-[#2c9c96] transition-colors shadow-md">
                  Dashboard
                </Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="text-center py-24 px-6 relative z-10">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight drop-shadow-sm">
          Supercharge Your <span className="text-[#38b2ac]">Cold Outreach</span> with AI
        </h1>
        <p className="text-xl max-w-2xl mx-auto text-[#475569] mb-10">
          ColdReach helps founders and sales pros generate hyper-personalized cold messages and emails using AI, backed by real LinkedIn data.
        </p>
        <SignedOut>
          <SignUpButton mode="modal">
            <Button size="lg" className="px-8 py-6 text-lg bg-[#38b2ac] text-white hover:bg-[#2c9c96] shadow-xl transition-transform transform hover:scale-105">
              Get Started Free →
            </Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <Link href="/dashboard">
            <Button size="lg" className="px-8 py-6 text-lg bg-[#38b2ac] text-white hover:bg-[#2c9c96] shadow-xl transition-transform transform hover:scale-105">
              Go to Dashboard →
            </Button>
          </Link>
        </SignedIn>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">How ColdReach Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StepCard icon={<Users size={32} />} title="1. Paste LinkedIn URL" desc="Extract rich data like name, company, title and more." />
          <StepCard icon={<Brain size={32} />} title="2. Let AI Do the Work" desc="ColdReach uses AI to write a message that feels human." />
          <StepCard icon={<Send size={32} />} title="3. Streamline Your Workflow"
  desc="Group messages into campaigns and manage your outreach pipeline effortlessly." />
        </div>
      </section>

      {/* Features */}
      <section className="bg-white/50 backdrop-blur-xl py-20 px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Why ColdReach?</h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <FeatureCard icon={<Sparkles size={34} />} title="AI Personalization" desc="Emails that feel handcrafted and warm." />
          <FeatureCard icon={<Settings2 size={34} />} title="Campaign Automation" desc="Build sequences and follow-ups effortlessly." />
          <FeatureCard icon={<BarChart size={34} />} title="Lead Analytics" desc="View replies, clicks and optimize campaigns." />
          <FeatureCard icon={<TrendingUp size={34} />} title="Conversion Focused" desc="Designed to get replies, not just sends." />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-4xl font-bold mb-4">Your Next Client is One Text Away.</h2>
        <p className="text-lg text-[#475569] mb-8">
          Let ColdReach help you craft the perfect cold message and close the deal.
        </p>
        <SignedOut>
          <SignUpButton mode="modal">
            <Button className="text-lg px-8 py-5 bg-[#38b2ac] text-white hover:bg-[#2c9c96] shadow-xl transition-transform transform hover:scale-105">
              Try it Free →
            </Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <Link href="/dashboard">
            <Button className="text-lg px-8 py-5 bg-[#38b2ac] text-white hover:bg-[#2c9c96] shadow-xl transition-transform transform hover:scale-105">
              Go to Dashboard →
            </Button>
          </Link>
        </SignedIn>
      </section>
    </div>
  )
}

// Reusable components with animation
function StepCard({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white/60 backdrop-blur-lg border border-white/30 rounded-xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-transform duration-300">
      <div className="text-[#38b2ac] mb-3">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-[#475569]">{desc}</p>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white/40 backdrop-blur-lg border border-white/30 rounded-xl p-6 shadow-md hover:shadow-xl hover:scale-105 transition-transform duration-300">
      <div className="text-[#38b2ac] mb-3">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-[#475569]">{desc}</p>
    </div>
  )
}

