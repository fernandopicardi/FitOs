import { Navbar } from '@/components/layout/Navbar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container max-w-screen-2xl mx-auto py-8 px-4 md:px-6">
        {children}
      </main>
      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-20 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with <span role="img" aria-label="magic wand">🪄</span> by Workout Wizard Inc.
          </p>
        </div>
      </footer>
    </div>
  );
}
