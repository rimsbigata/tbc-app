'use client';

import { useSupabaseClub } from '@/context/SupabaseClubContext';
import { RoleSelector, UserRole } from './RoleSelector';
import { useRouter } from 'next/navigation';

export function RoleSelectorWrapper({ children }: { children: React.ReactNode }) {
  const { userRole, setUserRole } = useSupabaseClub();
  const router = useRouter();

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role);
    // Redirect admin and queue master to sessions page, player to initial page
    if (role === 'admin' || role === 'queue_master') {
      router.push('/sessions');
    } else {
      router.push('/player');
    }
  };

  if (!userRole) {
    return <RoleSelector onRoleSelect={handleRoleSelect} />;
  }

  return <>{children}</>;
}
