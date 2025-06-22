'use client'

import { useSearchParams } from 'next/navigation'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { createSupabaseBrowserClient } from '@/lib/supabase'

export default function EmailGenPage() {
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get('email') || ''
  const initialContent = searchParams.get('content') || ''

  const [email, setEmail] = useState(initialEmail)
  const [content, setContent] = useState(initialContent)
  const [saving, setSaving] = useState(false)
  const [userUuid, setUserUuid] = useState<string | null>(null)

  const { user } = useUser()
  const supabase = createSupabaseBrowserClient()

  // Map Clerk user to Supabase user UUID
  useEffect(() => {
    const mapUser = async () => {
      if (!user) return
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      if (data?.id) setUserUuid(data.id)
      else console.error('Supabase user not found:', error?.message)
    }

    mapUser()
  }, [user])

  // Update email/content if query changes
  useEffect(() => {
    setEmail(initialEmail)
    setContent(initialContent)
  }, [initialEmail, initialContent])

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    alert('Email copied to clipboard!')
  }

  const handleSaveDraft = async () => {
    if (!userUuid) return alert('User not mapped yet.')

    setSaving(true)

    const { error } = await supabase.from('sent_emails').insert({
      user_id: userUuid,
      recipient_email: email,
      content,
      sent: false,
    })

    if (error) {
      console.error(error)
      alert('Failed to save email')
    } else {
      alert('Email saved as draft!')
    }

    setSaving(false)
  }

  return (
    <div>
      <h2 className="text-4xl font-bold mb-6">Email Editor</h2>

      <div className="space-y-4 bg-white/40 backdrop-blur-lg border border-white/30 rounded-xl shadow-md p-6">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Recipient Email"
        />

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={12}
        />

        <div className="flex gap-4">
          <Button onClick={handleCopy} className="bg-[#38b2ac] text-white hover:bg-[#2c9c96]">
            Copy Email
          </Button>
          <Button onClick={handleSaveDraft} disabled={saving} variant="outline">
            {saving ? 'Saving...' : 'Save as Draft'}
          </Button>
          <Button disabled variant="secondary" onClick={() => alert('Sending email coming soon!')}>
            Send Email (coming soon)
          </Button>
        </div>
      </div>
    </div>
  )
}
