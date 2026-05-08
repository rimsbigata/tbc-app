"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, ArrowRight, Link as LinkIcon } from 'lucide-react';

export default function PlayerInitialPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState('');
  const [sessionLink, setSessionLink] = useState('');
  const [useLink, setUseLink] = useState(false);

  const handleJoin = () => {
    const idToUse = useLink ? sessionLink : sessionId;
    
    // Extract session ID from link if using link format
    let finalSessionId = idToUse;
    if (useLink && idToUse.includes('/join/')) {
      finalSessionId = idToUse.split('/join/')[1];
    }
    
    if (!finalSessionId.trim()) {
      alert('Please enter a session ID or link');
      return;
    }
    
    router.push(`/join/${finalSessionId}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
      <div className="w-full max-w-md">
        <Card className="border-2 shadow-lg">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <User className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-black uppercase tracking-tight">Join Session</CardTitle>
            <CardDescription className="text-sm font-bold uppercase">
              Enter the session ID or link to join
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={!useLink ? "default" : "outline"}
                onClick={() => setUseLink(false)}
                className="flex-1 font-black uppercase text-xs"
              >
                Session ID
              </Button>
              <Button
                variant={useLink ? "default" : "outline"}
                onClick={() => setUseLink(true)}
                className="flex-1 font-black uppercase text-xs"
              >
                Session Link
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest">
                {useLink ? 'Session Link' : 'Session ID'}
              </Label>
              <Input
                placeholder={useLink ? 'https://tbc.app/join/...' : 'Enter session ID'}
                value={useLink ? sessionLink : sessionId}
                onChange={(e) => useLink ? setSessionLink(e.target.value) : setSessionId(e.target.value)}
                className="font-bold"
              />
            </div>

            <Button onClick={handleJoin} className="w-full gap-2">
              Join Session <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
