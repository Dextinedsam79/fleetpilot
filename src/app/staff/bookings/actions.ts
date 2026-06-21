'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveBookingAction(formData: FormData) {
  const supabase = await createClient()
  const bookingId = formData.get('bookingId') as string

  const { error } = await supabase
    .from('bookings')
    .update({ status: 'APPROVED' })
    .eq('id', bookingId)

  if (error) {
    console.error('Failed to approve booking:', error)
    return { error: error.message }
  }

  revalidatePath('/staff/bookings')
}

export async function updateBookingStatusAction(formData: FormData) {
  const supabase = await createClient()
  const bookingId = formData.get('bookingId') as string
  const status = formData.get('status') as string

  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)

  if (error) {
    console.error('Failed to update booking status:', error)
    return { error: error.message }
  }

  revalidatePath('/staff/bookings')
  revalidatePath(`/staff/bookings/${bookingId}`)
}
