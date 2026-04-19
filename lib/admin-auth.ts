import { getSupabaseServer } from '@/lib/supabase-server'

export type AdminRole = 'super_admin' | 'notes_only'

export type AdminUser = {
  id: string
  email: string
  role: AdminRole
}

export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await getSupabaseServer()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user || !user.email) {
    return null
  }

  const { data: adminRow, error: adminError } = await supabase
    .from('admin_users')
    .select('id, email, role')
    .eq('id', user.id)
    .single()

  if (adminError || !adminRow) {
    return null
  }

  return {
    id: adminRow.id,
    email: adminRow.email,
    role: adminRow.role as AdminRole,
  }
}

export async function requireAdmin() {
  const adminUser = await getAdminUser()

  if (!adminUser) {
    throw new Error('Unauthorized')
  }

  return adminUser
}

export async function requireSuperAdmin() {
  const adminUser = await requireAdmin()

  if (adminUser.role !== 'super_admin') {
    throw new Error('Forbidden')
  }

  return adminUser
}