import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button, buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { updateService } from '../actions'

export default async function EditMaintenancePage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ error?: string }> }) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const supabase = await createClient()
  
  const { data: record } = await supabase
    .from('maintenance_records')
    .select('*, vehicles(make, model, license_plate)')
    .eq('id', resolvedParams.id)
    .single()

  if (!record) {
    return <div className="p-6">Maintenance record not found.</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/staff/maintenance" className={buttonVariants({ variant: "outline" })}>Back</Link>
        <h2 className="text-2xl font-bold tracking-tight">Update Service</h2>
      </div>

      <Card>
        <form action={updateService}>
          <input type="hidden" name="id" value={record.id} />
          <CardHeader>
            <CardTitle>Maintenance Details</CardTitle>
            <CardDescription>{record.vehicles.make} {record.vehicles.model} ({record.vehicles.license_plate})</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {resolvedSearchParams?.error && (
              <div className="p-4 bg-destructive/10 text-destructive font-medium rounded border border-destructive/20">
                {resolvedSearchParams.error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Service Type</Label>
                <Input id="type" name="type" defaultValue={record.type} readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduled_date">Scheduled Date</Label>
                <Input id="scheduled_date" name="scheduled_date" type="date" defaultValue={record.scheduled_date || ''} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select 
                  id="status" 
                  name="status" 
                  defaultValue={record.status}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="DUE">Due</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Estimated/Final Cost (₦)</Label>
                <Input id="cost" name="cost" type="number" step="0.01" min="0" defaultValue={record.cost || ''} placeholder="e.g. 150.00" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description / Notes</Label>
              <Input id="description" name="description" defaultValue={record.description || ''} placeholder="Any additional details..." />
            </div>

          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Link href="/staff/maintenance" className={buttonVariants({ variant: "ghost" })}>Cancel</Link>
            <Button type="submit">Save Changes</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
