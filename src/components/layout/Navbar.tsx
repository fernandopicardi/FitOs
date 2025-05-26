
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { NAV_ITEMS } from '@/constants/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import logoImage from '../../app/logo1.png'; 

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 max-w-screen-2xl items-center px-4 md:px-6">
        <Link href="/" className="mr-6 flex items-center">
          <Image src={logoImage} alt="FitOS Logo" width={96} height={96} className="h-10 w-auto" />
        </Link>
        
        <nav className="hidden md:flex flex-1 items-center space-x-6 text-sm font-medium">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'transition-colors hover:text-foreground/80',
                pathname === item.href ? 'text-foreground' : 'text-foreground/60'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-4 md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Alternar Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[240px] p-4"> {/* Default padding for SheetContent */}
              <SheetHeader className="mb-6 text-left">
                <SheetTitle className="text-xl">Menu</SheetTitle>
              </SheetHeader>
              
              <Link href="/" className="flex items-center space-x-2 mb-8" onClick={() => setIsMobileMenuOpen(false)}>
                <Image src={logoImage} alt="FitOS Logo" width={80} height={80} className="h-8 w-auto" />
                <span className="font-bold text-xl text-primary">
                  FitOS
                </span>
              </Link>
              <nav className="flex flex-col space-y-3">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'text-lg transition-colors hover:text-foreground/80 py-2 px-3 rounded-md',
                      pathname === item.href ? 'bg-muted text-foreground font-semibold' : 'text-foreground/70 hover:bg-muted/50'
                    )}
                  >
                   <div className="flex items-center gap-2">
                      {item.icon && <item.icon className="h-5 w-5" />}
                      {item.label}
                    </div>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
