export interface SecurityMetrics {
  totalAttacks: number;
  uniqueAttackers: number;
  attacksLastHour: number;
  attacksToday: number;
  topCountry: string;
}

export interface AttacksByCountry {
  country: string;
  attacks: number;
  percentage: number;
}

export interface RecentAttack {
  ip: string;
  country: string;
  username: string;
  attempts: number;
  timestamp: string;
}

export interface TimelineData {
  hour: string;
  attacks: number;
}

export interface TopAttacker {
  ip: string;
  country: string;
  attacks: number;
  lastSeen: string;
}