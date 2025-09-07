'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SidebarProvider, Sidebar, SidebarInset, SidebarHeader, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
import { MainNav } from '@/components/main-nav';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Bell, UserCircle, LogOut } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const isLoginPage = pathname === '/login';

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn && !isLoginPage) {
      router.push('/login');
    }
  }, [pathname, router, isLoginPage]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    toast({
      title: 'Logout Berhasil',
      description: 'Anda telah keluar dari aplikasi.',
    });
    router.push('/login');
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <MainNav />
        </SidebarContent>
        <SidebarFooter>
          <Button variant="ghost" className="w-full justify-start gap-2" asChild>
            <Link href="/profile">
              <UserCircle className="size-4" />
              <span className="group-data-[collapsible=icon]:hidden">Profil</span>
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
            <LogOut className="size-4" />
            <span className="group-data-[collapsible=icon]:hidden">Logout</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-sm px-4 lg:px-6 sticky top-0 z-30">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            {/* Optional: Add a search bar or other header content here */}
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" aria-label="Notifikasi">
              <Bell className="h-5 w-5" />
            </Button>
             <Button variant="ghost" size="icon" aria-label="Profil Pengguna" asChild>
              <Link href="/profile">
                <UserCircle className="h-6 w-6" />
              </Link>
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}