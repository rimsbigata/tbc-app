"use client";

import { useSupabaseClub } from '@/context/SupabaseClubContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Calendar, Trophy, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function SessionsPage() {
  const { sessions, createSession, isAdmin, isQueueMaster } = useSupabaseClub();
  const router = useRouter();

  const handleCreateSession = async () => {
    const today = new Date().toISOString().split('T')[0];
    try {
      await createSession(today);
      // Clear any existing state before navigating
      router.push('/');
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleViewSession = (sessionId: string) => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Session Management</h1>
          <p className="text-muted-foreground font-medium">Create a new session or view ongoing sessions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-2 shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                <Plus className="h-6 w-6 text-primary" /> New Session
              </CardTitle>
              <CardDescription className="text-sm font-bold uppercase">
                Start a fresh session for today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleCreateSession} className="w-full h-12 font-black uppercase tracking-widest gap-2">
                Create Session <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg bg-card">
            <CardHeader>
              <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" /> Ongoing Sessions
              </CardTitle>
              <CardDescription className="text-sm font-bold uppercase">
                View and manage active sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {sessions.filter(s => s.is_active).length > 0 ? (
                sessions.filter(s => s.is_active).map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border-2 rounded-xl hover:border-primary/30 transition-all cursor-pointer"
                    onClick={() => handleViewSession(session.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-black text-sm">{session.sessionDate}</p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase">
                          {new Date(session.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="font-black h-6 px-2 text-compact bg-primary text-primary-foreground border-none">
                      Active
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground font-black uppercase text-sm border-2 border-dashed rounded-xl">
                  No ongoing sessions
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
