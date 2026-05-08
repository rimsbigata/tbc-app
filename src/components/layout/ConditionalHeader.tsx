"use client";

import { usePathname } from 'next/navigation';
import { Header } from './Header';

export function ConditionalHeader() {
  const pathname = usePathname();
  
  // Hide header on sessions, player, and join routes
  if (pathname === '/sessions' || pathname === '/player' || pathname?.startsWith('/join/')) {
    return null;
  }
  
  return <Header />;
}
