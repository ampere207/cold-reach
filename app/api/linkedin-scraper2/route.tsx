// app/api/linkedin-scraper2/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { linkedinUrl } = await req.json()

  const encodedUrl = encodeURIComponent(linkedinUrl)
  const apiUrl = `https://fresh-linkedin-profile-data.p.rapidapi.com/get-extra-profile-data?linkedin_url=${encodedUrl}`

  try {
    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY || '', // ✅ store key in .env
        'x-rapidapi-host': 'fresh-linkedin-profile-data.p.rapidapi.com',
      },
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('❌ LinkedIn API Error:', res.status, text)
      return NextResponse.json({ error: text }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json({ data })
  } catch (err) {
    console.error('❌ LinkedIn API Exception:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
