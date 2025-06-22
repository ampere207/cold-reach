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

  // 🧠 Map Clerk ID to Supabase UUID
  useEffect(() => {
    const mapClerkToSupabaseUser = async () => {
      if (!user) return

      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id) // since you're now inserting Clerk user.id directly as users.id
        .single()

      if (data?.id) setUserUuid(data.id)
      else console.error('Supabase user not found for Clerk ID:', error?.message)
    }

    mapClerkToSupabaseUser()
  }, [user])

  const handleCopy = () => {
    navigator.clipboard.writeText(template)
    alert('Email copied to clipboard!')
  }

  const generateMessage = async () => {
    setLoading(true)
    setTemplate('')

    setTimeout(async () => {
      const dummyData = `Hi [First Name],\n\nI came across your LinkedIn profile and was really impressed by your work at [Company]. Based on your background in [Industry], I think our product could genuinely help with ${motive}.\n\nWould love to connect and share more details.\n\nBest regards,\nTeam ColdReach`
      setTemplate(dummyData)
      setEmail('target@example.com')
      setLoading(false)

      if (userUuid) {
        const { error } = await supabase.from('templates').insert({
          user_id: userUuid,
          motive,
          content: dummyData,
          recipient_email: 'target@example.com',
        })
        if (error) console.error('[Insert Error]', error.message)
      }
    }, 1500)
  }

  const redirectToEmailGen = () => {
    const query = new URLSearchParams({ email, content: template }).toString()
    router.push(`/dashboard/templates/email-gen?${query}`)
  }

  return (
    <div>
      <h2 className="text-4xl font-bold mb-6">AI-Personalized Outreach</h2>

      <Card className="bg-white/40 backdrop-blur-lg border border-white/30 shadow-md mb-8">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
            <Input id="linkedin" placeholder="https://www.linkedin.com/in/example" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="motive">Motive of Outreach</Label>
            <Input id="motive" placeholder="e.g., offer a partnership, discuss a job opportunity..." value={motive} onChange={(e) => setMotive(e.target.value)} />
          </div>

          <Button onClick={generateMessage} className="bg-[#38b2ac] text-white hover:bg-[#2c9c96]" disabled={loading || !linkedinUrl || !motive}>
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
            <div className="space-y-2">
              <Label>Send to Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-[#38b2ac] text-white hover:bg-[#2c9c96]" disabled={!email || !template}>
                    Want to email this?
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white p-6 rounded-xl shadow-xl">
                  <h3 className="text-xl font-semibold mb-4">Proceed to Email Editor?</h3>
                  <p className="mb-6">Do you want to view, edit and send this email to <strong>{email}</strong>?</p>
                  <div className="flex justify-end gap-4">
                    <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={redirectToEmailGen} className="bg-[#38b2ac] text-white hover:bg-[#2c9c96]">
                      Yes, Open Editor
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
