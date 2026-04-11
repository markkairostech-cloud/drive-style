import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim() || ''
  const status = searchParams.get('status')?.trim() || ''

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let query = supabase
    .from('leads')
    .select(`
      id,
      name,
      email,
      phone,
      budget,
      budget_type,
      message,
      source,
      status,
      notes,
      created_at,
      advice!advice_lead_id_fkey (
        id,
        lead_id,
        recommendation,
        created_at
      )
    `)
    .order('created_at', { ascending: false })

  if (q) {
    query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%`)
  }

  if (status === 'open' || status === 'closed') {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const dedupedMap = new Map<string, any>()

  for (const lead of data || []) {
    const emailKey = (lead.email || '').toLowerCase()
    if (!emailKey) continue

    if (!dedupedMap.has(emailKey)) {
      dedupedMap.set(emailKey, lead)
    }
  }

  const deduped = Array.from(dedupedMap.values())

  return NextResponse.json({ leads: deduped })
}