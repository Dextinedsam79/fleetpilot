import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { ThemeToggle } from '@/components/theme-toggle'
import { signout } from './auth/actions'

export default async function LandingPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  let dashboardPath = '/customer/dashboard'
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role === 'STAFF') dashboardPath = '/staff/vehicles'
    if (profile?.role === 'MANAGER' || profile?.role === 'ADMIN') dashboardPath = '/manager/dashboard'
  }

  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*, vehicle_images(url, is_primary)')
    .eq('status', 'AVAILABLE')

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="h-16 border-b bg-background flex items-center px-6 justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <Image src="/logo.png" alt="FleetPilot Logo" width={32} height={32} className="object-contain" />
          <span className="font-bold text-xl text-primary tracking-tight">FleetPilot</span>
        </div>
        <nav className="flex items-center space-x-4">
          <ThemeToggle />
          {user ? (
            <>
              <Link href={dashboardPath} className="text-sm font-medium hover:text-primary transition-colors">Dashboard</Link>
              <form action={signout}>
                <button type="submit" className={buttonVariants({ variant: 'outline' })}>Sign Out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Sign In</Link>
              <Link href="/register" className={buttonVariants()}>Get Started</Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-24 px-6 text-center border-b">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-primary mb-6 drop-shadow-sm">Drive More. Manage Less.</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          The enterprise fleet management platform built for modern rental businesses.
          Book your next vehicle with absolute confidence.
        </p>
        <Link href="#fleet" className={buttonVariants({ size: "lg", className: "h-14 px-10 text-lg font-semibold shadow-xl rounded-full" })}>Browse Fleet</Link>
      </section>

      {/* Vehicle Catalogue */}
      <main id="fleet" className="flex-1 max-w-7xl mx-auto w-full p-6 py-16">
        <h2 className="text-3xl font-bold tracking-tight mb-8">Available Vehicles</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles && vehicles.length > 0 ? (
            vehicles.map((v: any) => (
              <Card key={v.id} className="overflow-hidden hover:shadow-lg transition-shadow border-border/50">
                <div className="aspect-[16/9] bg-muted relative">
                  <Image 
                    src={v.vehicle_images && v.vehicle_images.length > 0 
                      ? (v.vehicle_images.find((img: any) => img.is_primary)?.url || v.vehicle_images[0].url) 
                      : `https://loremflickr.com/800/600/${encodeURIComponent(v.make)},car/all`} 
                    alt={`${v.make} ${v.model}`} 
                    fill 
                    className="object-cover"
                    unoptimized // Because loremflickr uses redirects
                  />
                  <Badge className="absolute top-4 right-4">{v.status}</Badge>
                </div>
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>{v.year} {v.make} {v.model}</span>
                    <span className="text-lg text-primary">₦{v.daily_rate}<span className="text-sm text-muted-foreground font-normal">/day</span></span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground font-mono">
                    <span className="bg-muted px-2 py-1 rounded">VIN: {v.vin.substring(0,8)}...</span>
                    <span className="bg-muted px-2 py-1 rounded">Fuel: {v.fuel_level}%</span>
                    <span className="bg-muted px-2 py-1 rounded">Mi: {v.mileage.toLocaleString()}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/book/${v.id}`} className={buttonVariants({ className: "w-full" })}>Book Now</Link>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-muted-foreground">
              No vehicles available at the moment.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
