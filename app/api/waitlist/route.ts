import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  console.warn('NEXT_PUBLIC_SUPABASE_URL is not set')
}
if (!serviceRoleKey) {
  console.warn('SUPABASE_SERVICE_ROLE_KEY is not set')
}

const supabase = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey)
  : null

export async function POST(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
    }

    const { email } = await request.json()
    if (typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const { error } = await supabase
      .from('waitlist')
      .insert({ email })

    if (error) {
      // Unique constraint violation code for Postgres is typically '23505'
      if ((error as any).code === '23505') {
        return NextResponse.json({ message: 'Already on the waitlist' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Joined waitlist' }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}


