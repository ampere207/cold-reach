// app/api/linkedin-scraper4/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { linkedinUrl } = await req.json()

  const encodedUrl = encodeURIComponent(linkedinUrl)
  const apiUrl = `https://fresh-linkedin-profile-data.p.rapidapi.com/get-recommendations-received?linkedin_url=${encodedUrl}`

  try {
    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
        'x-rapidapi-host': 'fresh-linkedin-profile-data.p.rapidapi.com',
      },
    })

    if (!res.ok) {
      console.error('❌ LinkedIn Recommendations Received API Error:', res.status)
      return NextResponse.json({ error: 'LinkedIn recommendations-received fetch failed' }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json({ data })
  } catch (err) {
    console.error('❌ Recommendations Received API Exception:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
