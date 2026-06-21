import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { approveBookingAction } from './actions'

export default async function StaffBookingsPage() {
  const supabase = await createClient()
  
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, vehicles(make, model, license_plate), profiles(full_name, email)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Bookings Management</h2>
          <p className="text-muted-foreground">Approve, cancel, and track all vehicle reservations.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>Comprehensive list of fleet reservations.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings && bookings.length > 0 ? (
                bookings.map((b: any) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">
                      {b.profiles?.full_name}
                      <br/>
                      <span className="text-xs text-muted-foreground">{b.profiles?.email}</span>
                    </TableCell>
                    <TableCell>
                      {b.vehicles?.make} {b.vehicles?.model}
                      <br/>
                      <span className="font-mono text-xs text-muted-foreground">{b.vehicles?.license_plate}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(b.start_time).toLocaleDateString()}
                        <br/>
                        <span className="text-muted-foreground">to {new Date(b.end_time).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={b.status === 'PENDING_APPROVAL' ? 'destructive' : b.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {b.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <div className="flex justify-end gap-2">
                        {b.status === 'PENDING_APPROVAL' && (
                          <form action={approveBookingAction}>
                            <input type="hidden" name="bookingId" value={b.id} />
                            <Button type="submit" size="sm" variant="outline">Approve</Button>
                          </form>
                        )}
                        <Link href={`/staff/bookings/${b.id}`}>
                          <Button variant="ghost" size="sm">Details</Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No bookings found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
