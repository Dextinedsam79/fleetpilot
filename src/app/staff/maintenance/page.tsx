import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import Link from 'next/link'

export default async function MaintenancePage() {
  const supabase = await createClient()
  
  // Fetch maintenance records
  const { data: records, error } = await supabase
    .from('maintenance_records')
    .select('*, vehicles(make, model, license_plate)')
    .order('scheduled_date', { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Maintenance</h2>
          <p className="text-muted-foreground">Track and schedule vehicle maintenance.</p>
        </div>
        <Link href="/staff/maintenance/new" className={buttonVariants()}>Schedule Service</Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Schedule</CardTitle>
          <CardDescription>Upcoming and completed maintenance tasks.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead>Scheduled Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records && records.length > 0 ? (
                records.map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">
                      {r.vehicles?.make} {r.vehicles?.model}
                      <br/>
                      <span className="text-xs text-muted-foreground font-mono">{r.vehicles?.license_plate}</span>
                    </TableCell>
                    <TableCell>{r.type}</TableCell>
                    <TableCell>{r.scheduled_date || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={r.status === 'COMPLETED' ? 'secondary' : r.status === 'DUE' ? 'destructive' : 'default'}>
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{r.cost ? `₦${r.cost}` : '-'}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/staff/maintenance/${r.id}`}>
                        <Button variant="ghost" size="sm">Update</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No maintenance records found.
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
