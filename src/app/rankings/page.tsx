"use client";

import { useSupabaseClub } from '@/context/SupabaseClubContext';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, TrendingUp, Medal, Star, Target, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useMemo, useEffect } from 'react';
import { Match, SKILL_LEVELS_SHORT, getSkillColor } from '@/lib/types';

export default function RankingsPage() {
  const { players, matches, updatePlayer, doubleStarBoostEnabled } = useSupabaseClub();

  const getRankingsForPeriod = (periodMatches: Match[]) => {
    const stats: Record<string, { wins: number; total: number; diff: number }> = {};

    periodMatches.forEach(m => {
      if (m.status !== 'completed') return;
      const pIds = [...m.teamA, ...m.teamB];
      pIds.forEach(id => {
        if (!stats[id]) stats[id] = { wins: 0, total: 0, diff: 0 };
        stats[id].total += 1;
        const isTeamA = m.teamA.includes(id);
        const win = (m.winner === 'teamA' && isTeamA) || (m.winner === 'teamB' && !isTeamA);
        if (win) stats[id].wins += 1;
        if (m.teamAScore !== undefined && m.teamBScore !== undefined) {
          const scoreDiff = isTeamA ? (m.teamAScore - m.teamBScore) : (m.teamBScore - m.teamAScore);
          stats[id].diff += scoreDiff;
        }
      });
    });

    return players
      .filter(p => stats[p.id]?.total > 0)
      .map(p => {
        const s = stats[p.id];
        return {
          ...p,
          wins: s.wins,
          gamesPlayed: s.total,
          winRate: (s.wins / s.total) * 100,
          pointDiff: s.diff
        };
      })
      .sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        return b.pointDiff - a.pointDiff;
      });
  };

  const calculateDailyStars = (rankings: any[]) => {
    rankings.forEach((player, index) => {
      if (index < 4) {
        let starsEarned = 4 - index; // 1st=4, 2nd=3, 3rd=2, 4th=1
        if (doubleStarBoostEnabled) {
          starsEarned *= 2; // Double the stars if boost is enabled
        }
        const currentStars = player.stars || 0;
        updatePlayer(player.id, { stars: currentStars + starsEarned });
      }
    });
  };

  const todayMatches = useMemo(() => {
    const now = new Date().toDateString();
    return matches.filter(m => new Date(m.timestamp).toDateString() === now);
  }, [matches]);

  const monthMatches = useMemo(() => {
    const now = new Date();
    return matches.filter(m => {
      const d = new Date(m.timestamp);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [matches]);

  const dailyRankings = useMemo(() => getRankingsForPeriod(todayMatches), [todayMatches, players]);
  const monthlyRankings = useMemo(() => getRankingsForPeriod(monthMatches), [monthMatches, players]);

  // Calculate stars for daily rankings
  useEffect(() => {
    calculateDailyStars(dailyRankings);
  }, [dailyRankings]);

  const RenderLeaderboard = ({ data, isDaily }: { data: any[]; isDaily: boolean }) => (
    <div className="grid gap-1.5 pb-24">
      {data.map((player, i) => {
        const starCount = isDaily ? (4 - i) : player.stars || 0;
        const starsToDisplay = isDaily && i < 4 ? starCount : Math.min(starCount, 5);
        return (
          <Card key={player.id} className={cn(
            "border-2 transition-all hover:scale-[1.005] min-w-0",
            i === 0 ? "border-primary bg-primary/5" : "border-border"
          )}>
            <CardContent className="flex items-center justify-between p-3 gap-2">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className={cn(
                  "font-black text-2xl italic min-w-[24px] text-center shrink-0",
                  i === 0 ? "text-primary" : i === 1 ? "text-sky-500" : i === 2 ? "text-blue-700" : "text-muted-foreground/20"
                )}>
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-black text-compact flex items-center gap-1.5 truncate">
                    {player.name}
                    {starsToDisplay > 0 && (
                      <div className="flex items-center gap-0.5 shrink-0">
                        {Array.from({ length: starsToDisplay }).map((_, idx) => (
                          <Star key={idx} className={cn("h-3 w-3", isDaily ? "fill-primary text-primary" : "fill-yellow-400 text-yellow-400")} />
                        ))}
                      </div>
                    )}
                  </p>
                  <Badge variant="outline" className={cn("text-[8px] font-black uppercase px-1 h-3.5 mt-0.5 truncate", getSkillColor(player.skillLevel))}>
                    {SKILL_LEVELS_SHORT[player.skillLevel]}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-4 items-center shrink-0">
                <div className="text-center">
                  <p className="text-lg font-black text-primary">{player.wins}</p>
                  <p className="text-[7px] font-black uppercase text-muted-foreground">W</p>
                </div>
                <div className="text-center">
                  <p className="text-compact font-black opacity-60">{player.winRate.toFixed(0)}%</p>
                  <p className="text-[7px] font-black uppercase text-muted-foreground">WR</p>
                </div>
                <div className="text-right min-w-[32px]">
                  <p className={cn("text-tiny font-black", player.pointDiff > 0 ? "text-green-600" : "text-destructive")}>
                    {player.pointDiff > 0 ? `+${player.pointDiff}` : player.pointDiff}
                  </p>
                  <p className="text-[7px] font-black uppercase text-muted-foreground">DIFF</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      {data.length === 0 && (
        <div className="text-center py-20 border-4 border-dashed rounded-2xl bg-secondary/10 flex flex-col items-center">
          <Target className="h-10 w-10 mb-2 opacity-10" />
          <p className="font-black uppercase text-tiny tracking-widest opacity-40">No records found</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-4 md:py-6 space-y-4 md:space-y-6 max-w-5xl h-full overflow-auto">
      <header className="space-y-0.5 text-center sm:text-left shrink-0">
        <h1 className="flex items-center justify-center sm:justify-start gap-2 md:gap-3">
          <Trophy className="h-6 w-6 md:h-8 md:w-8 text-primary" /> Leaderboards
        </h1>
        <p className="text-tiny text-muted-foreground font-black uppercase tracking-widest opacity-60">Hall of fame based on tournament stats</p>
      </header>

      <Tabs defaultValue="daily" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-secondary/50 border-2">
            <TabsTrigger value="daily" className="gap-2 font-black uppercase text-[10px]">
              <TrendingUp className="h-3 w-3" /> Daily
            </TabsTrigger>
            <TabsTrigger value="monthly" className="gap-2 font-black uppercase text-[10px]">
              <Calendar className="h-3 w-3" /> Monthly
            </TabsTrigger>
          </TabsList>
          <div className="hidden sm:flex items-center gap-1 text-[8px] font-black uppercase text-muted-foreground bg-primary/5 px-2 py-1 rounded-full border">
            <Medal className="h-2.5 w-2.5 text-primary" /> Wins {'>'} Rate {'>'} Diff
          </div>
        </div>
        <TabsContent value="daily">
          <RenderLeaderboard data={dailyRankings} isDaily={true} />
        </TabsContent>
        <TabsContent value="monthly">
          <RenderLeaderboard data={monthlyRankings} isDaily={false} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
