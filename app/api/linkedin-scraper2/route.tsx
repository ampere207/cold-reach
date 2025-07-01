import { NextRequest, NextResponse } from 'next/server'

const RAPIDAPI_HOST = 'fresh-linkedin-profile-data.p.rapidapi.com'

const buildApiUrl = (linkedinUrl: string) => {
  const encodedUrl = encodeURIComponent(linkedinUrl)
  return `https://${RAPIDAPI_HOST}/get-extra-profile-data?linkedin_url=${encodedUrl}`
}

const fetchExtraData = async (url: string, apiKey: string) => {
  return await fetch(url, {
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
    let res = await fetchExtraData(apiUrl, primaryKey)

    if (!res.ok && [403, 429].includes(res.status) && fallbackKey) {
      console.warn(`⚠️ Primary API key failed (status ${res.status}). Retrying with fallback key...`)
      res = await fetchExtraData(apiUrl, fallbackKey)
    }

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
