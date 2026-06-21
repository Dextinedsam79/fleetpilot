import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import Link from 'next/link'

export default async function CustomerDashboardPage({ searchParams }: { searchParams: Promise<{ message: string }> }) {
  const resolvedSearchParams = await searchParams;
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  let bookings: any = []
  
  if (user) {
    const { data } = await supabase
      .from('bookings')
      .select('*, vehicles(make, model, year, license_plate)')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })
    
    bookings = data || []
  }

  return (
    <div className="space-y-6">
      {resolvedSearchParams?.message && (
        <div className="p-4 bg-primary/10 text-primary font-medium rounded border border-primary/20">
          {resolvedSearchParams.message}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Bookings</h2>
          <p className="text-muted-foreground">View your active and past rentals.</p>
        </div>
        <Link href="/" className={buttonVariants()}>Book New Vehicle</Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Booking History</CardTitle>
          <CardDescription>A list of all your reservations.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings && bookings.length > 0 ? (
                bookings.map((b: any) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">
                      {b.vehicles?.year} {b.vehicles?.make} {b.vehicles?.model}
                    </TableCell>
                    <TableCell>
                      {new Date(b.start_time).toLocaleDateString()} - {new Date(b.end_time).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={b.status === 'COMPLETED' ? 'secondary' : 'default'}>
                        {b.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">₦{b.total_price}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">View Details</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    You have no bookings yet.
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
