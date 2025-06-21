'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function SequencesPage() {
  const [steps, setSteps] = useState([{ subject: '', content: '' }])

  const handleStepChange = (index: number, field: string, value: string) => {
    const updated = [...steps]
    updated[index][field as 'subject' | 'content'] = value
    setSteps(updated)
  }

  const addStep = () => {
    setSteps([...steps, { subject: '', content: '' }])
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

      <Button onClick={addStep} className="bg-[#38b2ac] text-white hover:bg-[#2c9c96]">
        + Add Step
      </Button>
    </div>
  )
}