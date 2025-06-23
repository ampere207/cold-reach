// app/api/linkedin-scraper3/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { linkedinUrl } = await req.json()

  const encodedUrl = encodeURIComponent(linkedinUrl)
  const apiUrl = `https://fresh-linkedin-profile-data.p.rapidapi.com/get-recommendations-given?linkedin_url=${encodedUrl}`

  try {
    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
        'x-rapidapi-host': 'fresh-linkedin-profile-data.p.rapidapi.com',
      },
    })

    if (!res.ok) {
      console.error('❌ LinkedIn Recommendations Given API Error:', res.status)
      return NextResponse.json({ error: 'LinkedIn recommendations-given fetch failed' }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json({ data })
  } catch (err) {
    console.error('❌ Recommendations Given API Exception:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
