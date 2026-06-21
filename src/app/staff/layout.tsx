import Link from "next/link"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"
import { signout } from "../auth/actions"
import { createClient } from '@/lib/supabase/server'

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
  
  const isManager = profile?.role === 'MANAGER' || profile?.role === 'ADMIN'

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="h-16 flex items-center px-6 border-b space-x-2">
          <Image src="/logo.png" alt="FleetPilot Logo" width={24} height={24} className="object-contain" />
          <span className="font-bold text-lg text-primary tracking-tight">
            {isManager ? 'FleetPilot Manager' : 'FleetPilot Staff'}
          </span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {isManager && (
            <Link href="/manager/dashboard" className="block px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-sm font-medium">
              Analytics Overview
            </Link>
          )}
          <Link href="/staff/dashboard" className="block px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-sm font-medium">
            {isManager ? 'Staff Operations' : 'Dashboard'}
          </Link>
          <Link href="/staff/vehicles" className="block px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-sm font-medium">
            Vehicles
          </Link>
          <Link href="/staff/maintenance" className="block px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-sm font-medium">
            Maintenance
          </Link>
          <Link href="/staff/bookings" className="block px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-sm font-medium">
            Bookings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b bg-card flex items-center px-6 justify-between">
          <h1 className="font-semibold text-lg">{isManager ? 'Executive Portal' : 'Staff Portal'}</h1>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <span className="text-sm text-muted-foreground">Logged in as {isManager ? 'Manager' : 'Staff'}</span>
            <form action={signout}>
              <button type="submit" className="text-sm font-medium text-muted-foreground hover:text-primary">Sign Out</button>
            </form>
          </div>
        </header>
        <div className="flex-1 p-6 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
