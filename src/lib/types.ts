
export type PlayerStatus = 'available' | 'playing' | 'resting';
export type CourtStatus = 'available' | 'occupied';
export type MatchStatus = 'ongoing' | 'completed' | 'cancelled';

export interface Session {
  id: string
  sessionDate: string
  createdAt: Date
  is_active: boolean
  registeredPlayers?: SessionRegisteredPlayer[]
}

export interface SessionRegisteredPlayer {
  deviceId: string
  name: string
  joinedAt: string
}

export interface SessionParticipation {
  id: string
  sessionId: string
  playerId: string
  createdAt: Date
}

export const SKILL_LEVELS_SHORT: Record<number, string> = {
  1: "Beg",
  2: "Adv Beg",
  3: "Low Int",
  4: "Mid Int",
  5: "Up Int",
  6: "Adv",
  7: "Exp",
};

export const SKILL_LEVELS_FULL: Record<number, string> = {
  1: "Beginner",
  2: "Advanced Beginner",
  3: "Low Intermediate",
  4: "Mid Intermediate",
  5: "Upper Intermediate",
  6: "Advanced",
  7: "Expert",
};

/**
 * Centralized Skill Color Mapping (Single Source of Truth)
 * Standardized Hex Mapping with High-Contrast Accessible Colors.
 */
export const getSkillColor = (level: number) => {
  switch (level) {
    case 1:
      // Beginner (Beg) → #9CA3AF (neutral gray)
      return "bg-[#9CA3AF] text-slate-900 border-none font-bold";
    case 2:
      // Advanced Beginner (Adv Beg) - deep cyan
      return "bg-[#0891B2] text-white border-none font-bold";
    case 3:
      // Low Intermediate (Low Int) - sky blue
      return "bg-[#0284C7] text-white border-none font-bold";
    case 4:
      // Mid Intermediate (Mid Int) - strong blue
      return "bg-[#2563EB] text-white border-none font-bold";
    case 5:
      // Upper Intermediate (Up Int) - deep blue
      return "bg-[#1D4ED8] text-white border-none font-bold";
    case 6:
      // Advanced (Adv) - navy
      return "bg-[#1E3A8A] text-white border-none font-bold";
    case 7:
      // Expert (Exp) - midnight blue
      return "bg-[#172554] text-white border-none font-bold";
    default:
      return "bg-muted text-muted-foreground border-none font-bold";
  }
};

export interface PlayerSnapshot {
  id: string;
  name: string;
  skillLevel: number;
}

export interface Player {
  id: string;
  name: string;
  skillLevel: number;
  wins: number;
  gamesPlayed: number;
  partnerHistory: string[];
  status: PlayerStatus;
  improvementScore: number;
  totalPlayTimeMinutes: number;
  lastAvailableAt?: number;
  stars?: number;
}

export interface Court {
  id: string;
  name: string;
  status: CourtStatus;
  currentMatchId?: string | null;
}

export interface Match {
  id: string;
  teamA: string[];
  teamB: string[];
  teamASnapshots?: PlayerSnapshot[];
  teamBSnapshots?: PlayerSnapshot[];
  teamAScore?: number;
  teamBScore?: number;
  courtId?: string;
  timestamp: string;
  startTime?: string;
  endTime?: string;
  isCompleted: boolean;
  status: MatchStatus;
  winner?: 'teamA' | 'teamB' | null;
}

export interface Fee {
  id: string;
  shuttleFee: number;
  courtFee: number;
  entranceFee: number;
  qrCodeUrl?: string;
  payments: Record<string, boolean>;
}

export interface PaymentMethod {
  id: string;
  name: string;
  imageUrl: string;
}
