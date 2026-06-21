import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import Link from 'next/link'

export default async function VehiclesPage() {
  const supabase = await createClient()
  
  // Fetch vehicles
  const { data: vehicles, error } = await supabase
    .from('vehicles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Vehicles</h2>
          <p className="text-muted-foreground">Manage your fleet inventory and statuses.</p>
        </div>
        <Link href="/staff/vehicles/new" className={buttonVariants()}>Add Vehicle</Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fleet Overview</CardTitle>
          <CardDescription>A list of all vehicles in your inventory.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>License Plate</TableHead>
                  <TableHead>VIN</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Daily Rate</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles && vehicles.length > 0 ? (
                  vehicles.map((v: any) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.year} {v.make} {v.model}</TableCell>
                      <TableCell className="font-mono text-sm">{v.license_plate}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">{v.vin}</TableCell>
                      <TableCell>
                        <Badge variant={v.status === 'AVAILABLE' ? 'default' : 'secondary'}>
                          {v.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">₦{v.daily_rate}/day</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/staff/vehicles/${v.id}/edit`}>
                          <Button variant="ghost" size="sm">Edit</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No vehicles found. Add one to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
