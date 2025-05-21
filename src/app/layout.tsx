import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

// Note: The GeistSans and GeistMono objects from 'geist/font/*' directly provide .variable and .className
// No need to call them as functions like with next/font/google

export const metadata: Metadata = {
  title: 'Workout Wizard',
  description: 'Your ultimate companion for planning and logging workouts.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased font-sans`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
