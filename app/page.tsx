'use client'

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Sparkles, Mail, Settings2, BarChart } from 'lucide-react'
import { useSyncUser } from '@/lib/syncUser'

export default function Home() {
  useSyncUser()
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#B8FFF2] to-[#A0E7E5] relative overflow-hidden">
      {/* Background visual elements */}
      <div className="absolute w-96 h-96 bg-[#E3DFFF] rounded-full blur-3xl opacity-30 -top-10 -left-10 animate-pulse"></div>
      <div className="absolute w-72 h-72 bg-[#A0E7E5] rounded-full blur-2xl opacity-20 bottom-0 right-0 animate-ping"></div>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-20 backdrop-blur-lg bg-white/30 border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#1E293B]">
            Cold<span className="text-[#38b2ac]">Reach</span>
          </h1>

          <SignedOut>
            <div className="flex gap-4">
              <SignInButton mode="modal">
                <Button variant="outline" className="border-[#38b2ac] text-[#38b2ac] hover:bg-[#38b2ac]/10">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="bg-[#38b2ac] text-white hover:bg-[#2c9c96]">
                  Sign Up
                </Button>
              </SignUpButton>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button className="bg-[#38b2ac] text-white hover:bg-[#2c9c96]">Dashboard</Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="py-24 px-6 text-center relative z-10">
        <h1 className="text-5xl md:text-6xl font-extrabold text-[#1E293B] drop-shadow mb-6">
          Send Cold Emails That <span className="text-[#38b2ac]">Convert</span>
        </h1>
        <p className="text-xl text-[#475569] max-w-2xl mx-auto mb-10">
          ColdReach helps founders and sales pros send AI-personalized cold emails that actually get replies — all automated, all in one place.
        </p>
        <SignedOut>
          <SignUpButton mode="modal">
            <Button size="lg" className="px-8 py-6 text-lg bg-[#38b2ac] text-white hover:bg-[#2c9c96]">
              Get Started Free →
            </Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <Link href="/dashboard">
            <Button size="lg" className="px-8 py-6 text-lg bg-[#38b2ac] text-white hover:bg-[#2c9c96]">
              Go to Dashboard →
            </Button>
          </Link>
        </SignedIn>
      </section>

      {/* STEPS TO USE */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-[#1E293B] mb-12">
          How It Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="backdrop-blur-lg bg-white/40 border border-white/20 shadow-xl rounded-xl p-6 text-center">
            <Sparkles className="mx-auto mb-4 text-[#38b2ac]" size={36} />
            <h3 className="text-xl font-semibold mb-2">Generate Emails with AI</h3>
            <p className="text-[#475569]">
              Input your product, audience, and let AI craft high-converting outreach emails.
            </p>
          </div>

          {/* Step 2 */}
          <div className="backdrop-blur-lg bg-white/40 border border-white/20 shadow-xl rounded-xl p-6 text-center">
            <Settings2 className="mx-auto mb-4 text-[#38b2ac]" size={36} />
            <h3 className="text-xl font-semibold mb-2">Create Campaign Sequences</h3>
            <p className="text-[#475569]">
              Design automated email sequences with delays, follow-ups, and personalization.
            </p>
          </div>

          {/* Step 3 */}
          <div className="backdrop-blur-lg bg-white/40 border border-white/20 shadow-xl rounded-xl p-6 text-center">
            <BarChart className="mx-auto mb-4 text-[#38b2ac]" size={36} />
            <h3 className="text-xl font-semibold mb-2">Track Replies & Improve</h3>
            <p className="text-[#475569]">
              Analyze open/reply rates and optimize messaging with AI recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-4xl font-bold text-[#1E293B] mb-6">
          Start Reaching the Right People Today.
        </h2>
        <p className="text-lg text-[#475569] mb-10">
          Your next customer is one email away. Let ColdReach help you craft the perfect one.
        </p>

        <SignedOut>
          <SignUpButton mode="modal">
            <Button className="text-lg px-8 py-5 bg-[#38b2ac] text-white hover:bg-[#2c9c96]">
              Get Started Free →
            </Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <Link href="/app">
            <Button className="text-lg px-8 py-5 bg-[#38b2ac] text-white hover:bg-[#2c9c96]">
              Go to Dashboard →
            </Button>
          </Link>
        </SignedIn>
      </section>
    </div>
  )
}
