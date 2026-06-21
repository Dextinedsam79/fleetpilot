'use client'

import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { updateProfile } from './actions'
import { toast } from 'sonner'
import { useState } from 'react'

export function ProfileForm({ user, profile }: { user: any, profile: any }) {
  const [loading, setLoading] = useState(false)

  async function handleAction(formData: FormData) {
    setLoading(true)
    const result = await updateProfile(formData)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else if (result.success) {
      toast.success('Profile updated successfully!')
    }
  }

  return (
    <form action={handleAction}>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Update your personal details here.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" defaultValue={user.email} key={user.email} disabled className="bg-muted" />
          <p className="text-xs text-muted-foreground">Your email address cannot be changed here.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input id="full_name" name="full_name" defaultValue={profile?.full_name || ''} key={profile?.full_name || 'name'} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Account Type</Label>
          <Input id="role" defaultValue={profile?.role || 'CUSTOMER'} disabled className="bg-muted font-mono" />
        </div>

      </CardContent>
      <CardFooter className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardFooter>
    </form>
  )
}
