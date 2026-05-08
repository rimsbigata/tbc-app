"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, ArrowRight, Bell } from 'lucide-react';
import { useSupabaseClub } from '@/context/SupabaseClubContext';

export default function JoinSessionPage() {
  const { sessionId } = useParams();
  const router = useRouter();
  const { addPlayer, sessions } = useSupabaseClub();
  const [playerName, setPlayerName] = useState('');
  const [deviceId, setDeviceId] = useState<string>('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Generate or retrieve device ID
    let storedDeviceId = localStorage.getItem('device_id');
    if (!storedDeviceId) {
      storedDeviceId = generateDeviceId();
      localStorage.setItem('device_id', storedDeviceId);
    }
    setDeviceId(storedDeviceId);

    // Check if already registered for this session
    const registeredSessions = JSON.parse(localStorage.getItem('registered_sessions') || '[]');
    if (registeredSessions.includes(sessionId)) {
      setIsRegistered(true);
    }

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, [sessionId]);

  const generateDeviceId = () => {
    return 'device_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        new Notification('TBC', {
          body: 'Notifications enabled! You will be alerted when it\'s your turn.',
          icon: '/icon.png'
        });
      }
    }
  };

  const handleJoinSession = async () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }

    // Create player entry in the system
    try {
      await addPlayer({
        name: playerName,
        skillLevel: 3
      });

      // Save registration
      const registeredSessions = JSON.parse(localStorage.getItem('registered_sessions') || '[]');
      if (!registeredSessions.includes(sessionId)) {
        registeredSessions.push(sessionId);
        localStorage.setItem('registered_sessions', JSON.stringify(registeredSessions));
      }

      // Save player info for this session
      const sessionPlayers = JSON.parse(localStorage.getItem(`session_${sessionId}_players`) || '[]');
      sessionPlayers.push({
        deviceId,
        name: playerName,
        joinedAt: new Date().toISOString()
      });
      localStorage.setItem(`session_${sessionId}_players`, JSON.stringify(sessionPlayers));

      setIsRegistered(true);
    } catch (error) {
      console.error('Error joining session:', error);
      alert('Error joining session. Please try again.');
    }
  };

  const handleGoToSession = () => {
    router.push('/');
  };

  if (isRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
        <div className="w-full max-w-md">
          <Card className="border-2 shadow-lg">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4">
                <User className="h-8 w-8 text-green-500" />
              </div>
              <CardTitle className="text-2xl font-black uppercase tracking-tight">Registered!</CardTitle>
              <CardDescription className="text-sm font-bold uppercase">
                You are registered for this session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-xs font-bold uppercase text-muted-foreground mb-1">Your Device ID</div>
                <div className="font-mono text-sm">{deviceId}</div>
              </div>

              {notificationPermission !== 'granted' && (
                <Button
                  onClick={requestNotificationPermission}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <Bell className="h-4 w-4" />
                  Enable Notifications
                </Button>
              )}

              <Button onClick={handleGoToSession} className="w-full gap-2">
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
              Enter your name to register for this session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest">Your Name</Label>
              <Input
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="font-bold"
              />
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="text-xs font-bold uppercase text-muted-foreground mb-1">Your Device ID</div>
              <div className="font-mono text-sm">{deviceId}</div>
              <div className="text-[10px] text-muted-foreground mt-1">
                This ID will be used to identify you in the session
              </div>
            </div>

            <Button onClick={handleJoinSession} className="w-full gap-2">
              Join Session <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
