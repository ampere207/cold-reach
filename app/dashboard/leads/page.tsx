// app/dashboard/leads/page.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import Papa from 'papaparse'

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([])

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setLeads(results.data as any[])
      },
    })
  }

  return (
    <div>
      <h2 className="text-4xl font-bold mb-6">Leads</h2>

      <Card className="bg-white/40 backdrop-blur-lg border border-white/30 shadow-md mb-10">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-4">Upload Leads (CSV)</h3>
          <Input type="file" accept=".csv" onChange={handleCSVUpload} />
        </CardContent>
      </Card>

      {leads.length > 0 && (
        <Card className="bg-white/40 backdrop-blur-lg border border-white/30 shadow-md">
          <CardContent className="p-6 overflow-auto">
            <h3 className="text-xl font-semibold mb-4">Preview</h3>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-[#A0E7E5]/40">
                  {Object.keys(leads[0]).map((key) => (
                    <th key={key} className="text-left px-4 py-2 font-semibold">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, index) => (
                  <tr key={index} className="hover:bg-[#E3DFFF]/30">
                    {Object.values(lead).map((value, idx) => (
                      <td key={idx} className="px-4 py-2 border-b border-white/20">
                        {value as string}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
