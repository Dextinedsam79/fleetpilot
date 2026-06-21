import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button, buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { updateVehicle } from '../../actions'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function EditVehiclePage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ error?: string }> }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const supabase = await createClient();

  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', resolvedParams.id)
    .single();

  if (!vehicle) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/staff/vehicles" className={buttonVariants({ variant: "outline" })}>Back</Link>
        <h2 className="text-2xl font-bold tracking-tight">Edit Vehicle</h2>
      </div>

      <Card>
        <form action={updateVehicle}>
          <input type="hidden" name="id" value={vehicle.id} />
          <CardHeader>
            <CardTitle>Vehicle Details</CardTitle>
            <CardDescription>Update the details for this vehicle.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {resolvedSearchParams?.error && (
              <div className="p-4 bg-destructive/10 text-destructive font-medium rounded border border-destructive/20">
                {resolvedSearchParams.error}
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">Make</Label>
                <Input id="make" name="make" defaultValue={vehicle.make} placeholder="e.g. Toyota" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input id="model" name="model" defaultValue={vehicle.model} placeholder="e.g. Camry" required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input id="year" name="year" type="number" defaultValue={vehicle.year} min="1990" max="2100" placeholder="e.g. 2024" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mileage">Mileage</Label>
                <Input id="mileage" name="mileage" type="number" defaultValue={vehicle.mileage} min="0" placeholder="e.g. 1500" required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="license_plate">License Plate</Label>
                <Input id="license_plate" name="license_plate" defaultValue={vehicle.license_plate} placeholder="e.g. XYZ 1234" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vin">VIN Number</Label>
                <Input id="vin" name="vin" defaultValue={vehicle.vin} placeholder="17-character VIN" required minLength={17} maxLength={17} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="daily_rate">Daily Rental Rate (₦)</Label>
              <Input id="daily_rate" name="daily_rate" type="number" defaultValue={vehicle.daily_rate} step="0.01" min="1" placeholder="e.g. 45.00" required />
            </div>

          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Link href="/staff/vehicles" className={buttonVariants({ variant: "ghost" })}>Cancel</Link>
            <Button type="submit">Update Vehicle</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
