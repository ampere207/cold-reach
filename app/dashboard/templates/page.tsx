'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { useUser } from '@clerk/nextjs'

export default function TemplatesPage() {
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [motive, setMotive] = useState('')
  const [template, setTemplate] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [userUuid, setUserUuid] = useState<string | null>(null)

  const router = useRouter()
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
      else console.error('Supabase user not found for Clerk ID:', error?.message)
    }

    mapClerkToSupabaseUser()
  }, [user])

  const handleCopy = () => {
    navigator.clipboard.writeText(template)
    alert('message copied to clipboard!')
  }

  const fetchLinkedInData = async (url: string) => {
  try {
    const res = await fetch('/api/linkedin-scraper', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ linkedinUrl: url }),
    })

    if (!res.ok) {
      console.error('❌ LinkedIn fetch failed:', res.status)
      return null
    }

    const json = await res.json()
    const profile = json.data

    if (!profile) {
      console.error('❌ No profile data in response')
      return null
    }

    return {
      full_name: profile.full_name || `${profile.first_name} ${profile.last_name}` || 'there',
      current_company: profile.company || 'your company',
      industry: profile.company_industry || 'your industry',
      email: profile.email || '',
      job_title: profile.job_title || '',
      location: profile.location || '',
      headline: profile.headline || '',
      data: profile.data || '',
    }
  } catch (err) {
    console.error('❌ LinkedIn API Fetch Error:', err)
    return null
  }
}

const fetchExtraLinkedInData = async (url: string) => {
  try {
    const res = await fetch('/api/linkedin-scraper2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ linkedinUrl: url }),
    })

    if (!res.ok) return null
    const json = await res.json()
    return {
      certifications: json.data?.certifications || [],
      awards: json.data?.honors || [],
      publications: json.data?.publications || [],
    }
  } catch (err) {
    console.error('❌ LinkedIn Extra Fetch Error:', err)
    return null
  }
}

const fetchRecommendationsGiven = async (linkedinUrl: string) => {
  const res = await fetch('/api/linkedin-scraper3', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ linkedinUrl }),
  })
  const json = await res.json()
  return json.data || []
}

const fetchRecommendationsReceived = async (linkedinUrl: string) => {
  const res = await fetch('/api/linkedin-scraper4', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ linkedinUrl }),
  })
  const json = await res.json()
  return json.data || []
}



const generateMessage = async () => {
  setLoading(true)
  setTemplate('')

  const scrapedData = await fetchLinkedInData(linkedinUrl)
  const extras = await fetchExtraLinkedInData(linkedinUrl)
  const recommendationsGiven = await fetchRecommendationsGiven(linkedinUrl)
  const recommendationsReceived = await fetchRecommendationsReceived(linkedinUrl)

  if (!scrapedData || !extras) {
    alert('Failed to fetch LinkedIn data. Try again.')
    setLoading(false)
    return
  }

  const fullProfile = {
    ...scrapedData,
    ...extras,
    ...recommendationsGiven,
    ...recommendationsReceived,
    linkedin_url: linkedinUrl,
  }

  try {
    const res = await fetch('/api/generate-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile: fullProfile, motive }),
    })

    const data = await res.json()

    if (res.ok && data.message) {
      setTemplate(data.message)
    } else {
      setTemplate('Could not generate message. Please try again.')
      console.error('[Gemini Error]', data.error)
    }

    setEmail(scrapedData.email || 'target@example.com')

    if (userUuid) {
      const { error } = await supabase.from('templates').insert({
        user_id: userUuid,
        motive,
        content: data.message || 'Generation failed.',
        recipient_email: scrapedData.email || 'target@example.com',
        scraped_data: fullProfile,
      })
      if (error) console.error('[Insert Error]', error.message)
    }
  } catch (error) {
    console.error('❌ Error calling Gemini API route:', error)
    setTemplate('Could not generate message. Please try again.')
  } finally {
    setLoading(false)
  }
}



  return (
    <div>
      <h2 className="text-4xl font-bold mb-6">AI-Personalized Outreach</h2>

      <Card className="bg-white/40 backdrop-blur-lg border border-white/30 shadow-md mb-8">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
            <Input
              id="linkedin"
              placeholder="https://www.linkedin.com/in/example"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="motive">Motive of Outreach</Label>
            <Input
              id="motive"
              placeholder="e.g., offer a partnership, discuss a job opportunity..."
              value={motive}
              onChange={(e) => setMotive(e.target.value)}
            />
          </div>

          <Button
            onClick={generateMessage}
            className="bg-[#38b2ac] text-white hover:bg-[#2c9c96]"
            disabled={loading || !linkedinUrl || !motive}
          >
            {loading ? 'Generating...' : 'Generate Message'}
          </Button>
        </CardContent>
      </Card>

      {template && (
        <Card className="bg-white/40 backdrop-blur-lg border border-white/30 shadow-md">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-xl font-semibold">Generated Message</h3>
            <Textarea value={template} rows={10} readOnly />
            <Button onClick={handleCopy} className="bg-[#38b2ac] text-white hover:bg-[#2c9c96]">
              Copy Message
            </Button>
          
          </CardContent>
        </Card>
      )}
    </div>
  )
}
