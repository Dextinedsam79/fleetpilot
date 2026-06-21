import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createBookingAction } from '../actions'
import { redirect } from 'next/navigation'

export default async function BookingPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ error?: string }> }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const supabase = await createClient()

  // Get vehicle
  const { data: vehicle, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  if (error || !vehicle) {
    return <div className="p-12 text-center text-muted-foreground">Vehicle not found.</div>
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-12 px-4">
      <Card className="w-full max-w-2xl border-border/50">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight text-primary">Book Vehicle</CardTitle>
          <CardDescription>
            {vehicle.year} {vehicle.make} {vehicle.model}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resolvedSearchParams.error && (
            <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded border border-destructive/20">
              {resolvedSearchParams.error}
            </div>
          )}
          
          <div className="flex justify-between items-center bg-muted p-4 rounded-lg mb-6">
            <div>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Daily Rate</p>
              <p className="text-2xl font-bold text-primary">₦{vehicle.daily_rate}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Status</p>
              <p className="text-lg font-semibold">{vehicle.status}</p>
            </div>
          </div>

          <form id="booking-form" action={createBookingAction} className="space-y-6">
            <input type="hidden" name="vehicleId" value={vehicle.id} />
            <input type="hidden" name="dailyRate" value={vehicle.daily_rate} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startTime">Pickup Date</Label>
                <Input id="startTime" name="startTime" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Return Date</Label>
                <Input id="endTime" name="endTime" type="date" required />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4 border-t bg-muted/50 p-6">
          <Link href="/" className={buttonVariants({ variant: 'outline' })}>Cancel</Link>
          <Button form="booking-form" type="submit" size="lg">Confirm Booking</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
