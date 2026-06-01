import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "next-themes"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { SeedDbInit } from "@/components/seed-db-init"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Garden Companion",
  description: "Your smart garden management app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <header className="flex h-16 shrink-0 items-center gap-4 border-b px-6">
                <SidebarTrigger />
                <h1 className="text-lg font-semibold">Garden Companion</h1>
                <div className="ml-auto">
                  <ThemeToggle />
                </div>
              </header>
              <main className="flex flex-1 flex-col gap-4 p-6">
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
          <Toaster />
          <SeedDbInit />
        </ThemeProvider>
      </body>
    </html>
  )
}
