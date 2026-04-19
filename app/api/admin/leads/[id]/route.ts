import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAdminUser } from '@/lib/admin-auth'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const adminUser = await getAdminUser()

  if (!adminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: lead, error: leadError } = await supabase
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
      updated_at,
      advice!advice_lead_id_fkey (
        id,
        lead_id,
        recommendation,
        created_at
      )
    `)
    .eq('id', id)
    .single()

  if (leadError) {
    return NextResponse.json({ error: leadError.message }, { status: 500 })
  }

  const { data: history, error: historyError } = await supabase
    .from('leads')
    .select(`
      id,
      created_at
    `)
    .eq('email', lead.email)
    .order('created_at', { ascending: false })

  if (historyError) {
    return NextResponse.json({ error: historyError.message }, { status: 500 })
  }

  return NextResponse.json({
    lead,
    history: history || [],
    adminRole: adminUser.role,
  })
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const adminUser = await getAdminUser()

  if (!adminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const body = await request.json()

  const updatePayload: Record<string, unknown> = {}

  if (body?.status !== undefined) {
    if (adminUser.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden: only super_admin can change status.' },
        { status: 403 }
      )
    }

    if (
      body.status !== 'just_in' &&
      body.status !== 'working_on_it' &&
      body.status !== 'all_done'
    ) {
      return NextResponse.json(
        {
          error: 'Invalid status. Use "just_in", "working_on_it", or "all_done".',
        },
        { status: 400 }
      )
    }

    updatePayload.status = body.status
  }

  if (body?.notes !== undefined) {
    updatePayload.notes = body.notes
  }

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json(
      { error: 'No valid fields supplied.' },
      { status: 400 }
    )
  }

  // ✅ FORCE updated_at to update
  updatePayload.updated_at = new Date().toISOString()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error: updateError } = await supabase
    .from('leads')
    .update(updatePayload)
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  const { data: lead, error: leadError } = await supabase
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
      updated_at,
      advice!advice_lead_id_fkey (
        id,
        lead_id,
        recommendation,
        created_at
      )
    `)
    .eq('id', id)
    .single()

  if (leadError) {
    return NextResponse.json({ error: leadError.message }, { status: 500 })
  }

  const { data: history, error: historyError } = await supabase
    .from('leads')
    .select(`
      id,
      created_at
    `)
    .eq('email', lead.email)
    .order('created_at', { ascending: false })

  if (historyError) {
    return NextResponse.json({ error: historyError.message }, { status: 500 })
  }

  return NextResponse.json({
    lead,
    history: history || [],
    adminRole: adminUser.role,
  })
}