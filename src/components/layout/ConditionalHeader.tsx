"use client";

import { usePathname } from 'next/navigation';
import { Header } from './Header';

export function ConditionalHeader() {
  const pathname = usePathname();
  
  // Hide header on sessions route
  if (pathname === '/sessions') {
    return null;
  }
  
  return <Header />;
}
