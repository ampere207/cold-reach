'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function CampaignsPage() {
  const [campaignName, setCampaignName] = useState('')
  const [selectedSequence, setSelectedSequence] = useState('')
  const [targetAudience, setTargetAudience] = useState('')

  const handleLaunch = () => {
    alert(`Campaign "${campaignName}" launched with sequence "${selectedSequence}" targeting ${targetAudience}`)
  }

  return (
    <div>
      <h2 className="text-4xl font-bold mb-6">Launch Campaign</h2>

      <Card className="bg-white/40 backdrop-blur-lg border border-white/30 shadow-md">
        <CardContent className="p-6 space-y-4">
          <div>
            <Label>Campaign Name</Label>
            <Input
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="e.g., SaaS Founders Outreach"
            />
          </div>

          <div>
            <Label>Select Email Sequence</Label>
            <Input
              value={selectedSequence}
              onChange={(e) => setSelectedSequence(e.target.value)}
              placeholder="e.g., Follow-up Sequence 1"
            />
          </div>

          <div>
            <Label>Target Audience Description</Label>
            <Textarea
              rows={4}
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g., Startup founders on LinkedIn in FinTech"
            />
          </div>

          <Button onClick={handleLaunch} className="bg-[#38b2ac] text-white hover:bg-[#2c9c96]">
            Launch Campaign 🚀
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
