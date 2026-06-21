import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button, buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { scheduleService } from '../actions'

export default async function NewMaintenancePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const resolvedParams = await searchParams;
  const supabase = await createClient()
  
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('id, make, model, license_plate')
    .order('make', { ascending: true })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/staff/maintenance" className={buttonVariants({ variant: "outline" })}>Back</Link>
        <h2 className="text-2xl font-bold tracking-tight">Schedule Service</h2>
      </div>

      <Card>
        <form action={scheduleService}>
          <CardHeader>
            <CardTitle>Maintenance Details</CardTitle>
            <CardDescription>Create a new maintenance record for a vehicle.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {resolvedParams?.error && (
              <div className="p-4 bg-destructive/10 text-destructive font-medium rounded border border-destructive/20">
                {resolvedParams.error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="vehicle_id">Vehicle</Label>
              <select 
                id="vehicle_id" 
                name="vehicle_id" 
                required
                defaultValue=""
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="" disabled>Select a vehicle...</option>
                {vehicles?.map(v => (
                  <option key={v.id} value={v.id} className="bg-background text-foreground">
                    {v.make} {v.model} ({v.license_plate})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Service Type</Label>
                <Input id="type" name="type" placeholder="e.g. Oil Change, Tire Rotation" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduled_date">Scheduled Date</Label>
                <Input id="scheduled_date" name="scheduled_date" type="date" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select 
                  id="status" 
                  name="status" 
                  defaultValue="SCHEDULED"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="DUE">Due</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Estimated Cost (₦)</Label>
                <Input id="cost" name="cost" type="number" step="0.01" min="0" placeholder="e.g. 150.00" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description / Notes</Label>
              <Input id="description" name="description" placeholder="Any additional details..." />
            </div>

          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Link href="/staff/maintenance" className={buttonVariants({ variant: "ghost" })}>Cancel</Link>
            <Button type="submit">Schedule</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
