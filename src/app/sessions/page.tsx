"use client";

import { useSupabaseClub } from '@/context/SupabaseClubContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Share2, Check, Trophy, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function SessionsPage() {
  const { sessions, createSession, isAdmin, isQueueMaster } = useSupabaseClub();
  const router = useRouter();
  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null);
  const [newlyCreatedSessionId, setNewlyCreatedSessionId] = useState<string | null>(null);

  const handleCreateSession = async () => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const sessionId = await createSession(today);
      // Set the newly created session ID to show share option
      setNewlyCreatedSessionId(sessionId);
      // Clear any existing state before navigating
      router.push('/');
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleViewSession = (sessionId: string) => {
    router.push('/');
  };

  const generateSessionLink = (sessionId: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/join/${sessionId}`;
  };

  const handleCopyLink = (sessionId: string) => {
    const link = generateSessionLink(sessionId);
    navigator.clipboard.writeText(link);
    setCopiedSessionId(sessionId);
    setTimeout(() => setCopiedSessionId(null), 2000);
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
          <Card className="border-2 shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                <Plus className="h-6 w-6 text-primary" /> New Session
              </CardTitle>
              <CardDescription className="text-sm font-bold uppercase">
                Start a fresh session for today
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleCreateSession} className="w-full h-12 font-black uppercase tracking-widest gap-2">
                Create Session <ArrowRight className="h-4 w-4" />
              </Button>
              {newlyCreatedSessionId && (
                <Button
                  onClick={() => handleCopyLink(newlyCreatedSessionId)}
                  variant="outline"
                  className="w-full h-12 font-black uppercase tracking-widest gap-2"
                >
                  {copiedSessionId === newlyCreatedSessionId ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" /> Link Copied
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4" /> Share Session Link
                    </>
                  )}
                </Button>
              )}
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
                        <div className="font-black text-sm">{session.sessionDate}</div>
                        <div className="text-[10px] text-muted-foreground font-bold uppercase">
                          {new Date(session.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-black h-6 px-2 text-xs bg-primary text-primary-foreground border-none">
                        Active
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyLink(session.id);
                        }}
                      >
                        {copiedSessionId === session.id ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Share2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
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
