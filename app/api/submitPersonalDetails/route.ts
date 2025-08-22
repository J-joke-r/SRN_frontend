// app/api/submitPersonalDetails/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Resolve backend URL from env (server-side or public)
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL
    if (!backendUrl) {
      console.error('BACKEND_URL / NEXT_PUBLIC_BACKEND_URL not set in environment variables')
      return NextResponse.json(
        { message: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Forward request to backend API
    const res = await fetch(`${backendUrl}/api/personal-details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.get('Authorization') || '', // Supabase JWT if provided
      },
      body: JSON.stringify(body),
    })

    // Try parsing backend response
    let data
    try {
      data = await res.json()
    } catch {
      data = { message: 'Invalid JSON from backend' }
    }

    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error('Error in personal details API:', err)
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
