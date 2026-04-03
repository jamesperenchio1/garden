'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { usePathname } from 'next/navigation';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/plants': 'My Plants',
  '/plants/new': 'Add New Plant',
  '/weather': 'Weather Station',
  '/calendar': 'Planting Calendar',
  '/designer': 'System Designer',
  '/companions': 'Companion Planting',
  '/nutrients': 'Nutrient Calculator',
  '/soil': 'Soil Planner',
};

export function Header() {
  const pathname = usePathname();

  const getTitle = () => {
    if (pageTitles[pathname]) return pageTitles[pathname];
    if (pathname.startsWith('/plants/') && pathname !== '/plants/new') return 'Plant Details';
    if (pathname.startsWith('/designer/')) return 'Edit System';
    return 'Garden Companion';
  };

  return (
    <header className="flex h-14 items-center gap-3 border-b px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />
      <h2 className="text-lg font-semibold">{getTitle()}</h2>
    </header>
  );
}
