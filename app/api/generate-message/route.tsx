import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { profile, motive } = await req.json()

const prompt = `
You are an expert in writing highly personalized cold outreach messages that sound natural, professional, and engaging.

Here is the LinkedIn profile data of the target individual:
${JSON.stringify(profile)}

Motive for outreach: ${motive}

Write a comprehensive outreach message tailored to this individual. The tone should be friendly yet professional, personalized to their background, and should clearly express the purpose of the message without being salesy. The message should be between 150 and 180 words, not less than that. Avoid generic language and include details from their profile like roles, education, skills, awards, etc.

`

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  )

  const data = await res.json()

  if (data.error) {
    console.error('Gemini API error:', data.error)
    return NextResponse.json({ error: data.error.message }, { status: 500 })
  }

  const message =
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    'Could not generate message. Please try again.'

  return NextResponse.json({ message })
}
