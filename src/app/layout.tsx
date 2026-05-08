import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { SupabaseClubProvider } from '@/context/SupabaseClubContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Header } from '@/components/layout/Header';
import { Analytics } from '@vercel/analytics/next';
import { RoleSelectorWrapper } from '@/components/role/RoleSelectorWrapper';
import { ConditionalHeader } from '@/components/layout/ConditionalHeader';

export const metadata: Metadata = {
  title: 'TBC | Badminton Club',
  description: 'Badminton court queuing and matching for TBC.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <ThemeProvider>
          <SupabaseClubProvider>
            <RoleSelectorWrapper>
              <div className="flex flex-col h-screen md:min-h-screen w-full overflow-hidden">
                <ConditionalHeader />
                <main className="flex-1 overflow-auto">
                  {children}
                </main>
              </div>
            </RoleSelectorWrapper>
            <Toaster />
          </SupabaseClubProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
