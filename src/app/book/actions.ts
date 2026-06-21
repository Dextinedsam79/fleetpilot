'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createBookingAction(formData: FormData) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login?message=You must be logged in to book a vehicle')
  }

  const vehicleId = formData.get('vehicleId') as string
  const startTime = formData.get('startTime') as string
  const endTime = formData.get('endTime') as string
  const dailyRate = parseFloat(formData.get('dailyRate') as string)

  // Calculate total price (rough estimate by days)
  const days = Math.ceil((new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60 * 24))
  const totalPrice = days * dailyRate

  // Call the Postgres RPC
  const { data, error } = await supabase.rpc('create_booking', {
    p_customer_id: user.id,
    p_vehicle_id: vehicleId,
    p_start_time: startTime,
    p_end_time: endTime,
    p_total_price: totalPrice
  })

  if (error) {
    console.error('Booking Error:', error)
    // You could redirect back with an error param
    redirect(`/book/${vehicleId}?error=Conflict: ${error.message}`)
  }

  revalidatePath('/staff/bookings')
  revalidatePath('/customer/bookings')
  redirect('/customer/dashboard?message=Booking successful')
}
