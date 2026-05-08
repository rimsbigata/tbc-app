'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, User, Crown } from 'lucide-react';

export type UserRole = 'admin' | 'queue_master' | 'player';

interface RoleSelectorProps {
  onRoleSelect: (role: UserRole) => void;
}

export function RoleSelector({ onRoleSelect }: RoleSelectorProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const roles = [
    {
      id: 'admin' as UserRole,
      title: 'Admin',
      description: 'Full control of all features including settings and data management',
      icon: Crown,
      color: 'text-purple-500'
    },
    {
      id: 'queue_master' as UserRole,
      title: 'Queue Master',
      description: 'Manage matches, courts, and player roster with limited settings access',
      icon: Shield,
      color: 'text-primary'
    },
    {
      id: 'player' as UserRole,
      title: 'Player',
      description: 'View-only access to queue and courts, no editing capabilities',
      icon: User,
      color: 'text-green-500'
    }
  ];

  const handleSelect = (role: UserRole) => {
    setSelectedRole(role);
    localStorage.setItem('userRole', role);
    onRoleSelect(role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Select Your Role</h1>
          <p className="text-muted-foreground font-medium">Choose your access level for this session</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Card
                key={role.id}
                className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 ${selectedRole === role.id ? 'border-primary shadow-md' : 'border-border'
                  }`}
                onClick={() => handleSelect(role.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-center mb-2">
                    <div className={`p-3 rounded-full bg-muted ${role.color}`}>
                      <Icon className="h-8 w-8" />
                    </div>
                  </div>
                  <CardTitle className="text-center text-xl font-black uppercase">{role.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-sm">{role.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
