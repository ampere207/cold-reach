'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useUser } from '@clerk/nextjs'
import { createSupabaseBrowserClient } from '@/lib/supabase'

export default function SequencesPage() {
  const [steps, setSteps] = useState([{ subject: '', content: '' }])
  const [userUuid, setUserUuid] = useState<string | null>(null)

  const { user } = useUser()
  const supabase = createSupabaseBrowserClient()

  // 🔁 Map Clerk user ID to Supabase UUID
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

  // ✍️ Update sequence steps
  const handleStepChange = (index: number, field: string, value: string) => {
    const updated = [...steps]
    updated[index][field as 'subject' | 'content'] = value
    setSteps(updated)
  }

  // ➕ Add new step
  const addStep = () => {
    setSteps([...steps, { subject: '', content: '' }])
  }

  // 💾 Save the sequence to Supabase
  const saveSequence = async () => {
    if (!userUuid) return alert('User not loaded')

    const { error } = await supabase.from('sequences').insert({
      user_id: userUuid,
      name: `Sequence - ${new Date().toISOString()}`,
      steps,
    })

    if (error) {
      console.error('[Save Sequence Error]', error.message)
      alert('Error saving sequence')
    } else {
      alert('Sequence saved!')
      setSteps([{ subject: '', content: '' }])
    }
  }

  return (
    <div>
      <h2 className="text-4xl font-bold mb-6">Email Sequences</h2>

      {steps.map((step, index) => (
        <Card
          key={index}
          className="bg-white/40 backdrop-blur-lg border border-white/30 shadow-md mb-6"
        >
          <CardContent className="p-6 space-y-4">
            <h3 className="text-xl font-semibold">Step {index + 1}</h3>
            <div>
              <Label>Subject</Label>
              <Input
                value={step.subject}
                onChange={(e) => handleStepChange(index, 'subject', e.target.value)}
              />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                rows={6}
                value={step.content}
                onChange={(e) => handleStepChange(index, 'content', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex gap-4">
        <Button onClick={addStep} className="bg-[#38b2ac] text-white hover:bg-[#2c9c96]">
          + Add Step
        </Button>
        <Button variant="outline" onClick={saveSequence}>
          Save Sequence
        </Button>
      </div>
    </div>
  )
}
