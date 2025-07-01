'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { useUser } from '@clerk/nextjs'
import { Loader2 } from 'lucide-react'

export default function TemplatesPage() {
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [motive, setMotive] = useState('')
  const [template, setTemplate] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingStage, setLoadingStage] = useState('')
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null)
  const [userUuid, setUserUuid] = useState<string | null>(null)

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

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!userUuid) return
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, name')
        .eq('user_id', userUuid)
        .order('created_at', { ascending: false })

      if (!error && data) setCampaigns(data)
    }

    fetchCampaigns()
  }, [userUuid])

  const handleCopy = () => {
    navigator.clipboard.writeText(template)
    alert('message copied to clipboard!')
  }

  const fetchLinkedInData = async (url: string) => {
    setLoadingStage('Fetching Profile Data...')
    try {
      const res = await fetch('/api/linkedin-scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedinUrl: url }),
      })

      if (!res.ok) return null
      const json = await res.json()
      const profile = json.data
      if (!profile) return null

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
    setLoadingStage('Fetching Extra Data...')
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
    setLoadingStage('Fetching Profile Data...')

    const scrapedData = await fetchLinkedInData(linkedinUrl)
    const extras = await fetchExtraLinkedInData(linkedinUrl)
    const recommendationsGiven = await fetchRecommendationsGiven(linkedinUrl)
    const recommendationsReceived = await fetchRecommendationsReceived(linkedinUrl)

    if (!scrapedData || !extras) {
      alert('Failed to fetch LinkedIn data. Try again.')
      setLoading(false)
      setLoadingStage('')
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
      setLoadingStage('Generating Message...')
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
          recipient_name: scrapedData.full_name,
          scraped_data: fullProfile,
          campaign_selected: selectedCampaign || null,
        })
        if (error) console.error('[Insert Error]', error.message)
      }
    } catch (error) {
      console.error('❌ Error calling Gemini API route:', error)
      setTemplate('Could not generate message. Please try again.')
    } finally {
      setLoading(false)
      setLoadingStage('')
    }
  }

  return (
    <div className='py-8'>
      <h2 className="text-4xl font-bold mb-6 flex justify-center">Generate Cold Message</h2>

       <Card className="bg-white/40 backdrop-blur-lg border border-white/30 shadow-md mb-8">
    <CardContent className="p-6 space-y-4">
      {/* Inputs */}
      <div className="space-y-2">
        <Label htmlFor="linkedin" className="text-base font-medium">
          LinkedIn Profile URL
        </Label>
        <Input
          id="linkedin"
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          placeholder="https://www.linkedin.com/in/example"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="motive" className="text-base font-medium">
          Motive of Outreach
        </Label>
        <Input
          id="motive"
          value={motive}
          onChange={(e) => setMotive(e.target.value)}
          placeholder="e.g., discuss a role, offer a partnership..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="campaign" className="text-base font-medium">
          Assign to Campaign
        </Label>
        <select
          id="campaign"
          className="w-full p-2 rounded-md border bg-white/70 text-sm"
          value={selectedCampaign || ''}
          onChange={(e) =>
            setSelectedCampaign(e.target.value === '' ? null : e.target.value)
          }
        >
          <option value="">None</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={generateMessage}
          className="bg-[#38b2ac] text-white text-base font-semibold px-8 py-3 rounded-xl shadow-md hover:bg-[#2c9c96] hover:shadow-lg transition-all duration-300 ease-in-out disabled:opacity-50"
          disabled={loading || !linkedinUrl || !motive}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Generating Message...
            </>
          ) : (
            'Generate Message'
          )}
        </Button>
      </div>
    </CardContent>
  </Card>

  {/* 🔄 FULL-WIDTH LOADING PROGRESS (Below form card) */}
  {loading && (
    <div className="mb-8 p-6 rounded-lg border border-white/20 bg-white/30 backdrop-blur-md shadow-md w-full">
      <div className="text-sm font-medium text-gray-800 mb-2 text-center">
        {loadingStage}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 transition-all duration-700 ease-in-out ${
            loadingStage.includes('Profile')
              ? 'w-[25%] bg-[#38b2ac]'
              : loadingStage.includes('Extra')
              ? 'w-[50%] bg-[#2d9c96]'
              : loadingStage.includes('Recommendations')
              ? 'w-[75%] bg-[#2a8b89]'
              : loadingStage.includes('Generating')
              ? 'w-[100%] bg-[#267c7c]'
              : 'w-[0%]'
          }`}
        />
      </div>
    </div>
  )}

  {/* 📩 GENERATED MESSAGE */}
  {template && (
    <Card className="bg-white/40 backdrop-blur-lg border border-white/30 shadow-md">
      <CardContent className="p-6 space-y-4">
        <h3 className="text-xl font-semibold">Generated Message</h3>
        <Textarea value={template} rows={10} readOnly />
        <Button
          onClick={handleCopy}
          className="bg-[#38b2ac] text-white hover:bg-[#2c9c96]"
        >
          Copy Message
        </Button>
      </CardContent>
    </Card>
  )}
    </div>
  )
}
