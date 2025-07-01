// app/api/fetch-linkedin/route.ts
import { NextRequest, NextResponse } from 'next/server'

const RAPIDAPI_HOST = 'fresh-linkedin-profile-data.p.rapidapi.com'

const buildApiUrl = (linkedinUrl: string) => {
  const encodedUrl = encodeURIComponent(linkedinUrl)
  return `https://${RAPIDAPI_HOST}/get-linkedin-profile?linkedin_url=${encodedUrl}&include_skills=false&include_certifications=false&include_publications=false&include_honors=false&include_volunteers=false&include_projects=false&include_patents=false&include_courses=false&include_organizations=false&include_profile_status=false&include_company_public_url=false`
}

const fetchLinkedInData = async (apiUrl: string, apiKey: string) => {
  return await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': RAPIDAPI_HOST,
    },
  })
}

export async function POST(req: NextRequest) {
  const { linkedinUrl } = await req.json()
  const apiUrl = buildApiUrl(linkedinUrl)

  const primaryKey = process.env.RAPIDAPI_KEY || ''
  const fallbackKey = process.env.RAPIDAPI_KEY_FALLBACK || ''

  try {
    let res = await fetchLinkedInData(apiUrl, primaryKey)

    // If primary key fails with 403 or 429 (rate limit / auth), try fallback
    if (!res.ok && [403, 429].includes(res.status) && fallbackKey) {
      console.warn(`⚠️ Primary key failed with status ${res.status}, trying fallback key`)
      res = await fetchLinkedInData(apiUrl, fallbackKey)
    }

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
