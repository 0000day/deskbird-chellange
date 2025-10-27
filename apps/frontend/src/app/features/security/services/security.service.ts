import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
    AttacksByCountry,
    RecentAttack,
    SecurityMetrics,
    TimelineData,
    TopAttacker
} from '../models/security.models';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getSecurityMetrics(): Observable<SecurityMetrics> {
    return this.http.get<SecurityMetrics>(`${this.apiUrl}/security/metrics`);
  }

  getAttacksByCountry(): Observable<AttacksByCountry[]> {
    return this.http.get<AttacksByCountry[]>(`${this.apiUrl}/security/attacks-by-country`);
  }

  getRecentAttacks(limit: number = 10): Observable<RecentAttack[]> {
    return this.http.get<RecentAttack[]>(`${this.apiUrl}/security/recent-attacks?limit=${limit}`);
  }

  getAttackTimeline(hours: number = 24): Observable<TimelineData[]> {
    return this.http.get<TimelineData[]>(`${this.apiUrl}/security/timeline?hours=${hours}`);
  }

  getTopAttackers(limit: number = 10): Observable<TopAttacker[]> {
    return this.http.get<TopAttacker[]>(`${this.apiUrl}/security/top-attackers?limit=${limit}`);
  }
}