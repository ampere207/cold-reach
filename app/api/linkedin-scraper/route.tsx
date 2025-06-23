// app/api/fetch-linkedin/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { linkedinUrl } = await req.json()

  const encodedUrl = encodeURIComponent(linkedinUrl)
  const apiUrl = `https://fresh-linkedin-profile-data.p.rapidapi.com/get-linkedin-profile?linkedin_url=${encodedUrl}&include_skills=false&include_certifications=false&include_publications=false&include_honors=false&include_volunteers=false&include_projects=false&include_patents=false&include_courses=false&include_organizations=false&include_profile_status=false&include_company_public_url=false`

  try {
    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
        'x-rapidapi-host': 'fresh-linkedin-profile-data.p.rapidapi.com',
      },
    })

    if (!res.ok) {
      console.error('❌ LinkedIn API Error:', res.status)
      return NextResponse.json({ error: 'LinkedIn fetch failed' }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('❌ LinkedIn API Exception:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
