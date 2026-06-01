"use client"

import { usePathname, useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Leaf,
  Calendar,
  CloudSun,
  Box,
  GitBranch,
  FlaskConical,
  Layers,
  Sun,
  Cpu,
  CheckCircle2,
} from "lucide-react"

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/" },
  { title: "My Plants", icon: Leaf, url: "/plants" },
  { title: "Planting Calendar", icon: Calendar, url: "/calendar" },
  { title: "Weather", icon: CloudSun, url: "/weather" },
  { title: "System Designer", icon: Box, url: "/designer" },
  { title: "Companion Guide", icon: GitBranch, url: "/companions" },
  { title: "Nutrients", icon: FlaskConical, url: "/nutrients" },
  { title: "Soil Beds", icon: Layers, url: "/soil" },
  { title: "Sun Map", icon: Sun, url: "/sunmap" },
  { title: "IoT Devices", icon: Cpu, url: "/iot" },
  { title: "Tasks", icon: CheckCircle2, url: "/tasks" },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => {
              const isActive = pathname === item.url
              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    isActive={isActive}
                    onClick={() => router.push(item.url)}
                    tooltip={item.title}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
