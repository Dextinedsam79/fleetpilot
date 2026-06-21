import Link from "next/link"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"
import { signout } from "../auth/actions"

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="h-16 flex items-center px-6 border-b space-x-2">
          <Image src="/logo.png" alt="FleetPilot Logo" width={24} height={24} className="object-contain" />
          <span className="font-bold text-lg text-primary tracking-tight">FleetPilot</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/customer/dashboard" className="block px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-sm font-medium">
            My Bookings
          </Link>
          <Link href="/" className="block px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-sm font-medium">
            Browse Vehicles
          </Link>
          <Link href="/customer/profile" className="block px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-sm font-medium">
            Profile Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b bg-card flex items-center px-6 justify-between">
          <h1 className="font-semibold text-lg">Customer Portal</h1>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
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
