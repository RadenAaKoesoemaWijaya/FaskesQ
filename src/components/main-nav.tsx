'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, UserPlus, MessageSquareHeart } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const navItems = [
  { href: '/', label: 'Dasbor', icon: LayoutDashboard },
  { href: '/patients/new', label: 'Daftarkan Pasien', icon: UserPlus },
  {
    href: '/testimonials/new',
    label: 'Testimoni',
    icon: MessageSquareHeart,
  },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} legacyBehavior={false} passHref>
            <SidebarMenuButton
              as="a"
              isActive={pathname === item.href}
              tooltip={item.label}
              className={cn(
                'group-data-[collapsible=icon]:justify-center'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="group-data-[collapsible=icon]:hidden">
                {item.label}
              </span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
