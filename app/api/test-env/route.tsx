import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ key: process.env.GEMINI_API_KEY || 'not loaded' })
}
