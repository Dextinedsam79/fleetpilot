import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { updateBookingStatusAction } from '../actions'
import Link from 'next/link'

export default async function BookingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, vehicles(*), profiles(*)')
    .eq('id', resolvedParams.id)
    .single()

  if (!booking) {
    return <div className="p-6">Booking not found.</div>
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Booking Details</h2>
          <p className="text-muted-foreground">ID: {booking.id}</p>
        </div>
        <Link href="/staff/bookings">
          <Button variant="outline">Back to Bookings</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Name:</strong> {booking.profiles?.full_name || 'Unknown (Missing Profile)'}</p>
            <p><strong>Email:</strong> {booking.profiles?.email || 'N/A'}</p>
            <p><strong>Role:</strong> {booking.profiles?.role || 'N/A'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Make & Model:</strong> {booking.vehicles.make} {booking.vehicles.model} ({booking.vehicles.year})</p>
            <p><strong>License Plate:</strong> {booking.vehicles.license_plate}</p>
            <p><strong>VIN:</strong> {booking.vehicles.vin}</p>
            <p><strong>Daily Rate:</strong> ₦{booking.vehicles.daily_rate}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reservation Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Status</p>
              <Badge variant={booking.status === 'PENDING_APPROVAL' ? 'destructive' : booking.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-base">
                {booking.status}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Total Price</p>
              <p className="text-2xl font-bold text-primary">₦{booking.total_price}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Pickup Date</p>
              <p className="font-medium text-base">{new Date(booking.start_time).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Return Date</p>
              <p className="font-medium text-base">{new Date(booking.end_time).toLocaleString()}</p>
            </div>
          </div>

          <div className="pt-6 border-t mt-6">
            <h4 className="font-semibold mb-4">Update Status</h4>
            <div className="flex flex-wrap gap-2">
              <form action={updateBookingStatusAction}>
                <input type="hidden" name="bookingId" value={booking.id} />
                <input type="hidden" name="status" value="APPROVED" />
                <Button type="submit" variant="outline" disabled={booking.status === 'APPROVED'}>Approve</Button>
              </form>
              <form action={updateBookingStatusAction}>
                <input type="hidden" name="bookingId" value={booking.id} />
                <input type="hidden" name="status" value="ACTIVE" />
                <Button type="submit" variant="outline" disabled={booking.status === 'ACTIVE'}>Mark Active (Picked Up)</Button>
              </form>
              <form action={updateBookingStatusAction}>
                <input type="hidden" name="bookingId" value={booking.id} />
                <input type="hidden" name="status" value="COMPLETED" />
                <Button type="submit" variant="outline" disabled={booking.status === 'COMPLETED'}>Mark Completed (Returned)</Button>
              </form>
              <form action={updateBookingStatusAction}>
                <input type="hidden" name="bookingId" value={booking.id} />
                <input type="hidden" name="status" value="CANCELLED" />
                <Button type="submit" variant="destructive" disabled={booking.status === 'CANCELLED'}>Cancel Booking</Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
