'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Trophy, Banknote, Settings, Plus, Zap, Swords, Sun, Moon, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSupabaseClub } from '@/context/SupabaseClubContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { generateDeterministicMatch } from '@/lib/matchmaking';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { getSkillColor, SKILL_LEVELS_SHORT, Player, Court } from '@/lib/types';

export function Header() {
  const pathname = usePathname();
  const { courts, players, addCourt, startMatch, isPlayer, isAdmin } = useSupabaseClub();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const [isManualOpen, setIsManualOpen] = useState(false);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [selectedCourtId, setSelectedCourtId] = useState<string>('queue');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Players', href: '/players', icon: Users },
    { label: 'Rankings', href: '/rankings', icon: Trophy },
    { label: 'Fees', href: '/fees', icon: Banknote },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleQuickMatch = async () => {
    const availablePlayers = players.filter((p: Player) => p.status === 'available');
    const availableCourts = courts.filter((c: Court) => c.status === 'available');
    const result = generateDeterministicMatch(availablePlayers, availableCourts);

    if (result.matchCreated && result.teamA && result.teamB) {
      await startMatch({ teamA: result.teamA, teamB: result.teamB, courtId: result.courtId });
      toast({ title: result.courtId ? "Match Started!" : "Match Queued!" });
    } else {
      toast({ title: "Matchmaking Error", description: result.error || "Need 4 players.", variant: "destructive" });
    }
  };

  const handleManualMatchSubmit = async () => {
    if (selectedPlayerIds.length !== 4) return;

    await startMatch({
      teamA: [selectedPlayerIds[0], selectedPlayerIds[1]],
      teamB: [selectedPlayerIds[2], selectedPlayerIds[3]],
      courtId: selectedCourtId === 'queue' ? undefined : selectedCourtId
    });

    setIsManualOpen(false);
    setSelectedPlayerIds([]);
    toast({ title: "Manual Match Created" });
  };

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="h-14 md:h-16 border-b bg-card flex items-center justify-between px-4 md:px-6 shrink-0 shadow-md z-50 transition-colors">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-lg border bg-primary text-primary-foreground shadow-sm">
              <span className="text-xs md:text-sm font-black tracking-tighter">TBC</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm md:text-base font-black uppercase tracking-tighter leading-none text-primary">TBC</h1>
              <p className="text-[8px] text-muted-foreground font-black uppercase tracking-[0.25em] mt-1">Command Center</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 ml-6 border-l pl-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="icon"
                    className={cn(
                      "h-11 w-11 transition-all",
                      isActive ? "shadow-md shadow-primary/20 scale-105" : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                    )}
                    title={item.label}
                  >
                    <item.icon className={cn("h-5 w-5", isActive && "animate-pulse")} />
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 md:h-10 md:w-10 text-muted-foreground hover:text-primary transition-colors"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 md:h-5 md:w-5" /> : <Moon className="h-4 w-4 md:h-5 md:w-5" />}
          </Button>

          {!isPlayer && (
            <Button onClick={handleQuickMatch} className="md:hidden h-9 w-9 p-0 bg-primary shadow-lg shadow-primary/20 hover:scale-105 transition-all">
              <Zap className="h-4 w-4 fill-white" />
            </Button>
          )}

          {!isPlayer && (
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 md:h-10 md:w-10 border-2 hover:bg-secondary"
              onClick={() => {
                addCourt();
                toast({ title: "Court Added" });
              }}
            >
              <Plus className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          )}

          {!isPlayer && (
            <Dialog open={isManualOpen} onOpenChange={setIsManualOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="md:hidden h-9 w-9 p-0 border-2 hover:bg-secondary">
                  <Swords className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle className="text-lg font-black uppercase">Manual Match Selection</DialogTitle></DialogHeader>
                <div className="space-y-6 py-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest">Target Court</Label>
                    <Select value={selectedCourtId} onValueChange={setSelectedCourtId}>
                      <SelectTrigger className="h-12 font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="queue" className="font-bold">Send to Queue</SelectItem>
                        {courts.filter(c => c.status === 'available').map(c => (
                          <SelectItem key={c.id} value={c.id} className="font-bold">{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest">Select 4 Players</Label>
                    <ScrollArea className="h-48 border rounded-lg p-2">
                      <div className="space-y-2">
                        {players.filter((p: Player) => p.status === 'available').map((player) => (
                          <div key={player.id} className="flex items-center gap-2 p-2 rounded hover:bg-secondary/50">
                            <Checkbox
                              id={player.id}
                              checked={selectedPlayerIds.includes(player.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  if (selectedPlayerIds.length < 4) setSelectedPlayerIds([...selectedPlayerIds, player.id]);
                                } else {
                                  setSelectedPlayerIds(selectedPlayerIds.filter(id => id !== player.id));
                                }
                              }}
                            />
                            <label htmlFor={player.id} className="flex-1 text-xs font-bold truncate cursor-pointer">
                              {player.name}
                            </label>
                            <Badge variant="outline" className={cn("text-[9px] h-4 px-1.5", getSkillColor(player.skillLevel))}>
                              {SKILL_LEVELS_SHORT[player.skillLevel]}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  <Button
                    className="w-full font-black uppercase h-16 text-base shadow-xl shadow-primary/20"
                    disabled={selectedPlayerIds.length !== 4}
                    onClick={handleManualMatchSubmit}
                  >
                    Create Manual Match
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {!isPlayer && (
            <Button onClick={handleQuickMatch} className="hidden md:flex gap-2 bg-primary font-black uppercase text-[10px] tracking-widest h-10 px-4 shadow-lg shadow-primary/20 hover:scale-105 transition-all">
              <Zap className="h-4 w-4 fill-white" /> Quick
            </Button>
          )}

          {/* Desktop: Labeled buttons */}
          {!isPlayer && (
            <Dialog open={isManualOpen} onOpenChange={setIsManualOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="hidden md:flex gap-2 font-black uppercase text-[10px] tracking-widest h-10 border-2 hover:bg-secondary px-4">
                  <Swords className="h-4 w-4" /> Manual
                </Button>
              </DialogTrigger>
            </Dialog>
          )}

          {/* Mobile Hamburger Menu */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-card shadow-xl animate-in slide-in-from-right">
            <nav className="flex flex-col p-4 space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={() => handleNavClick(item.href)}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 h-12",
                        isActive ? "shadow-md shadow-primary/20" : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-semibold">{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
