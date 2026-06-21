import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default async function StaffDashboard() {
  const supabase = await createClient()

  // Fetch quick metrics for the dashboard
  const { count: pendingBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'PENDING_APPROVAL')

  const { count: availableVehicles } = await supabase
    .from('vehicles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'AVAILABLE')

  const { count: dueMaintenance } = await supabase
    .from('maintenance_records')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'DUE')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Staff Dashboard</h2>
        <p className="text-muted-foreground">Overview of fleet operations and pending tasks.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBookings || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires approval</p>
            <div className="mt-4">
              <Link href="/staff/bookings" className={buttonVariants({ variant: 'outline', size: 'sm', className: 'w-full' })}>
                View Bookings
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableVehicles || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Ready for rent</p>
            <div className="mt-4">
              <Link href="/staff/vehicles" className={buttonVariants({ variant: 'outline', size: 'sm', className: 'w-full' })}>
                Manage Fleet
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dueMaintenance || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Vehicles needing service</p>
            <div className="mt-4">
              <Link href="/staff/maintenance" className={buttonVariants({ variant: 'outline', size: 'sm', className: 'w-full' })}>
                Schedule Service
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
