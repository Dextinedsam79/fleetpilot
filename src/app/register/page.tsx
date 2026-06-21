import { signup } from '../auth/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ message: string }> }) {
  const resolvedSearchParams = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-tr from-secondary/10 via-background to-primary/5 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

      <Card className="w-full max-w-md relative z-10 border-border/50 shadow-2xl backdrop-blur-sm bg-background/80">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">Sign up to start managing your fleet with FleetPilot.</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="register-form" className="flex flex-col space-y-4" action={signup}>
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" name="full_name" type="text" placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="john@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Account Role (For Testing)</Label>
              <select 
                id="role" 
                name="role" 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="CUSTOMER">Customer</option>
                <option value="STAFF">Staff</option>
                <option value="MANAGER">Manager</option>
              </select>
            </div>
            {resolvedSearchParams?.message && (
              <p className="text-sm text-destructive text-center">{resolvedSearchParams.message}</p>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button form="register-form" type="submit" className="w-full">Sign Up</Button>
          <div className="text-sm text-center text-muted-foreground">
            Already have an account? <Link href="/login" className="text-primary hover:underline">Sign in</Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
