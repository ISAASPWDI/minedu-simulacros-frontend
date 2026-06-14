import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { SimulationService } from '../../../core/services/simulation.service';
import { PaymentService } from '../../../core/services/payment.service';
import { UserStats, SessionSummary } from '../../../core/models/simulation.model';
import { UserSubscription } from '../../../core/models/payment.model';
import { EscalaPipe } from '../../../shared/pipes/escala.pipe';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, ChartModule, TagModule, TableModule, SkeletonModule, EscalaPipe, PageHeaderComponent],
  templateUrl: './teacher-dashboard.component.html',
  styleUrl: './teacher-dashboard.component.scss'
})
export class TeacherDashboardComponent implements OnInit {
  private simulationService = inject(SimulationService);
  private paymentService = inject(PaymentService);
  private router = inject(Router);

  stats = signal<UserStats | null>(null);
  recentSessions = signal<SessionSummary[]>([]);
  subscription = signal<UserSubscription | null>(null);
  loading = signal(true);
  chartData = signal<any>(null);
  chartOptions = signal<any>(null);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.simulationService.getStats().subscribe({
      next: (s) => {
        this.stats.set(s);
        this.buildChart(s.scoreHistory);
      },
      error: () => {}
    });

    this.simulationService.getHistory(0, 3).subscribe({
      next: (page) => {
        this.recentSessions.set(page.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    this.paymentService.getSubscription().subscribe({
      next: (sub) => this.subscription.set(sub),
      error: () => this.subscription.set(null)
    });
  }

  buildChart(scores: number[]): void {
    this.chartData.set({
      labels: scores.map((_, i) => `Sim. ${i + 1}`),
      datasets: [{
        label: 'Puntaje',
        data: scores,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }]
    });
    this.chartOptions.set({
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: { color: '#94a3b8' },
          grid: { color: 'rgba(255,255,255,0.05)' }
        },
        x: {
          ticks: { color: '#94a3b8' },
          grid: { color: 'rgba(255,255,255,0.05)' }
        }
      }
    });
  }

  getPassedSeverity(passed: boolean): 'success' | 'danger' {
    return passed ? 'success' : 'danger';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = { COMPLETED: 'Completado', ABANDONED: 'Abandonado', IN_PROGRESS: 'En progreso' };
    return map[status] ?? status;
  }

  goToExams(): void {
    this.router.navigate(['/teacher/exams']);
  }

  goToResult(sessionId: string): void {
    this.router.navigate(['/teacher/results', sessionId]);
  }

  get approvalRate(): number {
    const s = this.stats();
    if (!s || s.totalSessions === 0) return 0;
    return Math.round((s.passedSessions / s.totalSessions) * 100);
  }
}
