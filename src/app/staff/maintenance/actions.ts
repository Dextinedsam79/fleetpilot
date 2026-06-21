'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function scheduleService(formData: FormData) {
  const supabase = await createClient()

  const vehicle_id = formData.get('vehicle_id') as string
  const type = formData.get('type') as string
  const description = formData.get('description') as string
  const scheduled_date = formData.get('scheduled_date') as string
  const status = formData.get('status') as string || 'SCHEDULED'
  const costStr = formData.get('cost') as string
  const cost = costStr ? parseFloat(costStr) : null

  const { error } = await supabase.from('maintenance_records').insert({
    vehicle_id,
    type,
    description,
    scheduled_date: scheduled_date ? scheduled_date : null,
    status,
    cost
  })

  if (error) {
    redirect(`/staff/maintenance/new?error=${encodeURIComponent(error.message)}`)
  }

  // Also update vehicle status to MAINTENANCE if it's currently IN_PROGRESS or SCHEDULED (optional, but good for UX).
  // For now, let's just insert the record.

  revalidatePath('/staff/maintenance')
  redirect('/staff/maintenance')
}

export async function updateService(formData: FormData) {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const status = formData.get('status') as string
  const description = formData.get('description') as string
  const scheduled_date = formData.get('scheduled_date') as string
  const costStr = formData.get('cost') as string
  const cost = costStr ? parseFloat(costStr) : null

  const { error } = await supabase.from('maintenance_records').update({
    status,
    description,
    scheduled_date: scheduled_date ? scheduled_date : null,
    cost
  }).eq('id', id)

  if (error) {
    redirect(`/staff/maintenance/${id}?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/staff/maintenance')
  redirect('/staff/maintenance')
}
