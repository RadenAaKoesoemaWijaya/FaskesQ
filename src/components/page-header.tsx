import type { ReactNode } from 'react';

export function PageHeader({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
      <h1 className="text-3xl font-bold font-headline text-foreground tracking-tight">
        {title}
      </h1>
      {children && (
        <div className="flex items-center gap-2 shrink-0">{children}</div>
      )}
    </div>
  );
}
