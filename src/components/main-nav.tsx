'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, UserPlus, MessageSquareHeart, Laptop, Settings, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';

type Role = 'doctor' | 'nurse' | 'administrator';

const navItems = [
  { href: '/', label: 'Dasbor', icon: LayoutDashboard, roles: ['doctor', 'nurse'] },
  { href: '/patients/new', label: 'Daftarkan Pasien', icon: UserPlus, roles: ['doctor', 'nurse', 'administrator'] },
  { href: '/teleconsultation', label: 'Telekonsultasi', icon: Laptop, roles: ['doctor'] },
  {
    href: '/testimonials',
    label: 'Testimoni',
    icon: MessageSquareHeart,
    roles: ['doctor', 'nurse', 'administrator']
  },
  { href: '/screening-settings', label: 'Pengaturan Skrining', icon: Settings, roles: ['doctor'] },
  { href: '/loginizer', label: 'Loginizer', icon: Users, roles: ['doctor', 'nurse', 'administrator'] },
];

export function MainNav() {
  const pathname = usePathname();
  const [currentRole, setCurrentRole] = useState<Role>('doctor');

  const filteredNavItems = navItems.filter(item => item.roles.includes(currentRole));

  // Only show role switcher if on the loginizer page or for demo purposes on all pages.
  // We'll restrict to loginizer page for a cleaner UI on other pages.
  const showRoleSwitcher = pathname === '/loginizer';

  return (
    <>
      <SidebarMenu>
        {filteredNavItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} passHref>
              <SidebarMenuButton
                isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
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

      {showRoleSwitcher && (
         <div className="p-4 mt-auto border-t border-sidebar-border group-data-[collapsible=icon]:hidden animate-in fade-in-50">
            <Label className="text-xs text-muted-foreground">Simulasi Peran Pengguna</Label>
             <RadioGroup value={currentRole} onValueChange={(value) => setCurrentRole(value as Role)} className="mt-2 space-y-1">
                <div>
                    <RadioGroupItem value="doctor" id="role-doctor" className="peer sr-only" />
                    <Label htmlFor="role-doctor" className="block w-full text-center text-sm p-2 rounded-md border cursor-pointer peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground">
                        Dokter
                    </Label>
                </div>
                 <div>
                    <RadioGroupItem value="nurse" id="role-nurse" className="peer sr-only" />
                    <Label htmlFor="role-nurse" className="block w-full text-center text-sm p-2 rounded-md border cursor-pointer peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground">
                        Perawat
                    </Label>
                </div>
                 <div>
                    <RadioGroupItem value="administrator" id="role-administrator" className="peer sr-only" />
                    <Label htmlFor="role-administrator" className="block w-full text-center text-sm p-2 rounded-md border cursor-pointer peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground">
                        Admin
                    </Label>
                </div>
            </RadioGroup>
        </div>
      )}
    </>
  );
}
