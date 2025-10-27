import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
  timestamp: Date;
}

export interface TimelineData {
  hour: string;
  attacks: number;
}

export interface TopAttacker {
  ip: string;
  country: string;
  attacks: number;
  lastSeen: Date;
}

@Injectable()
export class SecurityService {
  constructor(private prisma: PrismaService) {}

  private getCountryName(countryCode: string): string {
    const countryMap: Record<string, string> = {
      'PT': 'Portugal', 'PK': 'Pakistan', 'HK': 'Hong Kong', 'IN': 'India',
      'ID': 'Indonesia', 'CN': 'China', 'NL': 'Netherlands', 'RO': 'Romania',
      'DE': 'Germany', 'US': 'United States', 'RU': 'Russia', 'BR': 'Brazil',
      'FR': 'France', 'GB': 'United Kingdom', 'JP': 'Japan', 'KR': 'South Korea',
      'UA': 'Ukraine', 'TR': 'Turkey', 'IT': 'Italy', 'ES': 'Spain',
      'VN': 'Vietnam', 'TH': 'Thailand', 'MY': 'Malaysia', 'SG': 'Singapore',
      'AU': 'Australia', 'CA': 'Canada', 'MX': 'Mexico', 'AR': 'Argentina',
      'CL': 'Chile', 'PE': 'Peru', 'CO': 'Colombia', 'VE': 'Venezuela',
      'EG': 'Egypt', 'SA': 'Saudi Arabia', 'AE': 'United Arab Emirates',
      'IL': 'Israel', 'IR': 'Iran', 'IQ': 'Iraq', 'SY': 'Syria',
      'ZA': 'South Africa', 'NG': 'Nigeria', 'KE': 'Kenya', 'GH': 'Ghana',
      'NZ': 'New Zealand', 'BD': 'Bangladesh', 'BO': 'Bolivia',
      'PL': 'Poland', 'CZ': 'Czech Republic', 'AT': 'Austria', 'CH': 'Switzerland',
      'SE': 'Sweden', 'NO': 'Norway', 'DK': 'Denmark', 'FI': 'Finland',
      'BE': 'Belgium', 'GR': 'Greece', 'HU': 'Hungary', 'BG': 'Bulgaria',
      'HR': 'Croatia', 'PH': 'Philippines', 'LK': 'Sri Lanka', 'MM': 'Myanmar'
    };
    return countryMap[countryCode] || countryCode || 'Unknown';
  }

  async getSecurityMetrics(): Promise<SecurityMetrics> {
    const [
      totalAttacks,
      uniqueAttackers,
      attacksLastHour,
      attacksToday,
      topCountryResult
    ] = await Promise.all([
      this.prisma.attackAttempt.count(),
      this.prisma.ipAddress.count(),
      this.prisma.attackAttempt.count({
        where: { timestamp: { gte: new Date(Date.now() - 60 * 60 * 1000) } }
      }),
      this.prisma.attackAttempt.count({
        where: { timestamp: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } }
      }),
      this.prisma.ipAddress.findFirst({
        orderBy: { attackCount: 'desc' },
        select: { country: true }
      })
    ]);

    return {
      totalAttacks,
      uniqueAttackers,
      attacksLastHour,
      attacksToday,
      topCountry: topCountryResult?.country || 'Unknown'
    };
  }

  async getAttacksByCountry(): Promise<AttacksByCountry[]> {
    const countryStats = await this.prisma.ipAddress.groupBy({
      by: ['country'],
      _sum: { attackCount: true },
      orderBy: { _sum: { attackCount: 'desc' } },
      take: 10  // Limit to top 10 countries
    });

    const totalAttacks = countryStats.reduce((sum, stat) => sum + (stat._sum.attackCount || 0), 0);

    return countryStats
      .filter(stat => stat.country && stat.country !== 'Unknown')
      .map(stat => ({
        country: this.getCountryName(stat.country!),
        attacks: stat._sum.attackCount || 0,
        percentage: Math.round(((stat._sum.attackCount || 0) / totalAttacks) * 100)
      }));
  }

  async getRecentAttacks(limit: number = 10): Promise<RecentAttack[]> {
    const recentAttacks = await this.prisma.attackAttempt.findMany({
      take: limit,
      orderBy: { timestamp: 'desc' },
      include: {
        ipAddress: {
          select: {
            ipAddress: true,
            country: true,
            attackCount: true
          }
        }
      }
    });

    return recentAttacks.map(attack => ({
      ip: attack.ipAddress.ipAddress,
      country: this.getCountryName(attack.ipAddress.country || ''),
      username: attack.username,
      attempts: attack.ipAddress.attackCount,
      timestamp: attack.timestamp
    }));
  }

  async getAttackTimeline(hours: number = 24): Promise<TimelineData[]> {
    const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const attacks = await this.prisma.attackAttempt.findMany({
      where: { timestamp: { gte: hoursAgo } },
      select: { timestamp: true }
    });

    // Create timeline slots for the last X hours (oldest first for chart display)
    const now = new Date();
    const timeline: TimelineData[] = [];
    
    for (let i = hours - 1; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourStart = new Date(hour);
      hourStart.setMinutes(0, 0, 0); // Set to start of hour
      
      const hourEnd = new Date(hourStart);
      hourEnd.setHours(hourEnd.getHours() + 1); // End of hour
      
      // Count attacks in this hour slot
      const attacksInHour = attacks.filter(attack => 
        attack.timestamp >= hourStart && attack.timestamp < hourEnd
      ).length;
      
      // Format hour label as actual time (e.g., "14:00")
      const hourLabel = hourStart.getHours().toString().padStart(2, '0') + ':00';
      
      timeline.push({
        hour: hourLabel,
        attacks: attacksInHour
      });
    }

    return timeline;
  }

  async getTopAttackers(limit: number = 10): Promise<TopAttacker[]> {
    const topAttackers = await this.prisma.ipAddress.findMany({
      take: limit,
      orderBy: { attackCount: 'desc' },
      select: {
        ipAddress: true,
        country: true,
        attackCount: true,
        updatedAt: true
      }
    });

    return topAttackers.map(attacker => ({
      ip: attacker.ipAddress,
      country: this.getCountryName(attacker.country || ''),
      attacks: attacker.attackCount,
      lastSeen: attacker.updatedAt
    }));
  }
}