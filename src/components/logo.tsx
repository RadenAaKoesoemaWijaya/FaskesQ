import { Stethoscope } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo() {
  return (
    <div
      className={cn(
        'flex items-center gap-2.5 font-headline text-xl font-bold text-sidebar-foreground',
        'group-data-[collapsible=icon]:hidden'
      )}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Stethoscope className="h-5 w-5" />
      </div>
      <span className="mt-1">FaskesQ</span>
    </div>
  );
}
