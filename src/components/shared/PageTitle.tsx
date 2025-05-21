import type React from 'react';

interface PageTitleProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode; // For actions like buttons
}

export function PageTitle({ title, subtitle, children }: PageTitleProps) {
  return (
    <div className="mb-8 pb-4 border-b border-border/60">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-lg text-muted-foreground">{subtitle}</p>}
        </div>
        {children && <div className="shrink-0">{children}</div>}
      </div>
    </div>
  );
}
