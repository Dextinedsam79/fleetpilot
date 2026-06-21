import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { signout } from "../auth/actions"

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <span className="font-bold text-lg text-primary tracking-tight">FleetPilot Manager</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/manager/dashboard" className="block px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-sm font-medium">
            Analytics Overview
          </Link>
          <Link href="/staff/vehicles" className="block px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-sm font-medium">
            Fleet Management
          </Link>
          <Link href="/staff/bookings" className="block px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-sm font-medium">
            All Bookings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b bg-card flex items-center px-6 justify-between">
          <h1 className="font-semibold text-lg">Executive Dashboard</h1>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <span className="text-sm text-muted-foreground">Logged in as Manager</span>
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
