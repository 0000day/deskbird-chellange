import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, forkJoin, interval, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';

// PrimeNG Modules
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';

// Security interfaces and models
import {
  AttacksByCountry,
  RecentAttack,
  SecurityMetrics,
  TimelineData
} from '../models/security.models';

// Services
import { SecurityService } from '../services/security.service';

// Local interface for metrics display
interface SecurityMetric {
  label: string;
  value: number;
  change: number;
  severity: 'success' | 'warning' | 'danger' | 'info';
}

@Component({
  selector: 'app-security-insights',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ChartModule,
    TagModule,
    TableModule,
    PanelModule,
    ToastModule
  ],
  templateUrl: './security-insights.component.html',
  styleUrls: ['./security-insights.component.scss'],
  providers: [MessageService]
})
export class SecurityInsightsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Real-time metrics
  securityMetrics: SecurityMetric[] = [];
  attacksByCountry: AttacksByCountry[] = [];
  recentAttacks: RecentAttack[] = [];

  // Chart data for attacks over time
  chartData: any;
  chartOptions: any;
  
  // Loading states
  loading = true;

  constructor(
    private securityService: SecurityService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initializeChartOptions();
    this.loadSecurityData();
    this.startRealTimeUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadSecurityData(): void {
    this.loading = true;
    
    forkJoin({
      metrics: this.securityService.getSecurityMetrics(),
      attacksByCountry: this.securityService.getAttacksByCountry(),
      recentAttacks: this.securityService.getRecentAttacks(10),
      timeline: this.securityService.getAttackTimeline(24)
    }).pipe(
      takeUntil(this.destroy$),
      catchError((error: any) => {
        console.error('Error loading security data:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load security data'
        });
        return of(null);
      })
    ).subscribe((data: any) => {
      if (data.metrics) {
        this.buildSecurityMetrics(data.metrics);
      }
      if (data.attacksByCountry) {
        this.attacksByCountry = data.attacksByCountry;
      }
      if (data.recentAttacks) {
        this.recentAttacks = data.recentAttacks;
      }
      if (data.timeline) {
        this.buildChartData(data.timeline);
      }
      this.loading = false;
    });
  }

  private buildSecurityMetrics(metrics: SecurityMetrics): void {
    this.securityMetrics = [
      { 
        label: 'Failed Logins (Last Hour)', 
        value: metrics.attacksLastHour, 
        change: 0, // We could calculate this if we had previous data
        severity: metrics.attacksLastHour > 50 ? 'danger' : 'warning' 
      },
      { 
        label: 'Total Attacks Today', 
        value: metrics.attacksToday, 
        change: 0, 
        severity: 'info' 
      },
      { 
        label: 'Unique Attackers', 
        value: metrics.uniqueAttackers, 
        change: 0, 
        severity: 'warning' 
      },
      { 
        label: 'Total Attack Attempts', 
        value: metrics.totalAttacks, 
        change: 0, 
        severity: 'danger' 
      }
    ];
  }

  private buildChartData(timeline: TimelineData[]): void {
    const labels = timeline.map(item => item.hour);
    const data = timeline.map(item => item.attacks);

    this.chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Attack Attempts',
          data: data,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#ef4444',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5
        }
      ]
    };
  }

  private initializeChartOptions(): void {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12
            }
          }
        },
        title: {
          display: true,
          text: 'Security Events Timeline (Last 24 Hours)',
          font: {
            size: 16,
            weight: 'bold'
          },
          padding: 20
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#374151',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            title: function(context: any) {
              return `Time: ${context[0].label}`;
            },
            label: function(context: any) {
              return `${context.dataset.label}: ${context.parsed.y}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(156, 163, 175, 0.2)'
          },
          ticks: {
            font: {
              size: 11
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(156, 163, 175, 0.2)'
          },
          ticks: {
            font: {
              size: 11
            },
            callback: function(value: any) {
              return Number.isInteger(value) ? value : '';
            }
          }
        }
      },
      animation: {
        duration: 750,
        easing: 'easeInOutQuart'
      }
    };
  }

  private startRealTimeUpdates(): void {
    // Refresh data every 5 minutes
    interval(30_000).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.loadSecurityData();
    });
  }

  getSeverityClass(severity: string): string {
    const severityMap: { [key: string]: string } = {
      'success': 'text-green-600',
      'warning': 'text-orange-600', 
      'danger': 'text-red-600',
      'info': 'text-blue-600'
    };
    return severityMap[severity] || 'text-gray-600';
  }

  getChangeClass(change: number): string {
    if (change > 0) return 'text-red-600';
    if (change < 0) return 'text-green-600';
    return 'text-gray-600';
  }

  getChangeIcon(change: number): string {
    if (change > 0) return 'pi pi-arrow-up';
    if (change < 0) return 'pi pi-arrow-down';
    return 'pi pi-minus';
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }
}