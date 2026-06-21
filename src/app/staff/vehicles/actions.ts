'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addVehicle(formData: FormData) {
  const supabase = await createClient()

  const make = formData.get('make') as string
  const model = formData.get('model') as string
  const year = parseInt(formData.get('year') as string)
  const license_plate = formData.get('license_plate') as string
  const vin = formData.get('vin') as string
  const daily_rate = parseFloat(formData.get('daily_rate') as string)
  const mileage = parseInt(formData.get('mileage') as string)

  const { data: vehicle, error } = await supabase.from('vehicles').insert({
    make,
    model,
    year,
    license_plate,
    vin,
    daily_rate,
    mileage,
    status: 'AVAILABLE'
  }).select('id').single()

  if (error) {
    redirect(`/staff/vehicles/new?error=${encodeURIComponent(error.message)}`)
  }

  // Insert a default image from the internet based on the car make
  const imageUrl = `https://loremflickr.com/800/600/${encodeURIComponent(make)},car/all`
  await supabase.from('vehicle_images').insert({
    vehicle_id: vehicle.id,
    url: imageUrl,
    is_primary: true
  })

  revalidatePath('/staff/vehicles')
  redirect('/staff/vehicles')
}
