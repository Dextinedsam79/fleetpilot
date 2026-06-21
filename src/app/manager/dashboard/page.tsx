import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default async function ManagerDashboardPage() {
  const supabase = await createClient()
  
  // Fetch some analytics (Mocked for now since views aren't fully populated)
  // In a real scenario, you'd call an RPC or select from a materialized view
  const { count: totalVehicles } = await supabase.from('vehicles').select('*', { count: 'exact', head: true })
  const { count: activeBookings } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE')
  const { count: pendingBookings } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'PENDING_APPROVAL')
  
  // Calculate revenue (Sum of total_price from completed/active bookings)
  const { data: revenueData } = await supabase.from('bookings').select('total_price').in('status', ['ACTIVE', 'COMPLETED'])
  const totalRevenue = revenueData?.reduce((sum, b) => sum + Number(b.total_price), 0) || 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Overview</h2>
          <p className="text-muted-foreground">High-level metrics and performance indicators.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">₦{totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Fleet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-secondary">{totalVehicles || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Active Rentals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-chart-1">{activeBookings || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-chart-4">{pendingBookings || 0}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* More detailed charts could go here */}
    </div>
  )
}
