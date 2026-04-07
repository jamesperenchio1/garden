'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Cloud,
  CalendarDays,
  Leaf,
  Droplets,
  Users,
  FlaskConical,
  Mountain,
  ImageIcon,
  MessageSquarePlus,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';

const navItems = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard },
  { title: 'My Plants', href: '/plants', icon: Leaf },
  { title: 'Gallery', href: '/gallery', icon: ImageIcon },
  { title: 'Companions', href: '/companions', icon: Users },
  { title: 'Weather', href: '/weather', icon: Cloud },
  { title: 'Calendar', href: '/calendar', icon: CalendarDays },
  { title: 'System Designer', href: '/designer', icon: Droplets },
  { title: 'Nutrients', href: '/nutrients', icon: FlaskConical },
  { title: 'Soil Planner', href: '/soil', icon: Mountain },
  { title: 'Features & Feedback', href: '/features', icon: MessageSquarePlus },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white font-bold text-sm">
            GC
          </div>
          <div>
            <h1 className="text-sm font-semibold">Garden Companion</h1>
            <p className="text-xs text-muted-foreground">Thailand Edition</p>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton isActive={isActive} render={<Link href={item.href} />}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <p className="text-xs text-muted-foreground">
          Garden Companion v1.0
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
