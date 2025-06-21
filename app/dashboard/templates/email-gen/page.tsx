'use client'

import { useSearchParams } from 'next/navigation'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

export default function EmailGenPage() {
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get('email') || ''
  const initialContent = searchParams.get('content') || ''

  const [email, setEmail] = useState(initialEmail)
  const [content, setContent] = useState(initialContent)

  useEffect(() => {
    setEmail(initialEmail)
    setContent(initialContent)
  }, [initialEmail, initialContent])

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    alert('Email copied to clipboard!')
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
          <Button variant="outline" onClick={() => alert('Feature coming soon!')}>
            Send Email
          </Button>
        </div>
      </div>
    </div>
  )
}
