import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Select } from 'primeng/select';
import { PaginatorModule } from 'primeng/paginator';
import { SimulationService } from '../../../core/services/simulation.service';
import { SessionSummary, UserStats } from '../../../core/models/simulation.model';
import { EscalaPipe } from '../../../shared/pipes/escala.pipe';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TableModule, TagModule, Select, PaginatorModule, EscalaPipe, PageHeaderComponent],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent implements OnInit {
  private simulationService = inject(SimulationService);
  private router = inject(Router);

  sessions = signal<SessionSummary[]>([]);
  stats = signal<UserStats | null>(null);
  totalRecords = signal(0);
  loading = signal(true);
  currentPage = signal(0);
  pageSize = 10;

  filterStatus = signal<string | null>(null);

  statusOptions = [
    { label: 'Todos', value: null },
    { label: 'Aprobado', value: 'COMPLETED_PASSED' },
    { label: 'Desaprobado', value: 'COMPLETED_FAILED' },
    { label: 'Abandonado', value: 'ABANDONED' }
  ];

  ngOnInit(): void {
    this.loadStats();
    this.loadHistory();
  }

  loadStats(): void {
    this.simulationService.getStats().subscribe({
      next: (s) => this.stats.set(s),
      error: () => {}
    });
  }

  loadHistory(): void {
    this.loading.set(true);
    this.simulationService.getHistory(this.currentPage(), this.pageSize).subscribe({
      next: (page) => {
        this.sessions.set(page.content);
        this.totalRecords.set(page.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onPageChange(event: any): void {
    this.currentPage.set(event.page);
    this.loadHistory();
  }

  viewResult(sessionId: string): void {
    this.router.navigate(['/teacher/results', sessionId]);
  }

  getStatusSeverity(passed: boolean, status: string): 'success' | 'danger' | 'secondary' {
    if (status === 'ABANDONED') return 'secondary';
    return passed ? 'success' : 'danger';
  }

  getStatusLabel(passed: boolean, status: string): string {
    if (status === 'ABANDONED') return 'Abandonado';
    return passed ? 'Aprobado' : 'Desaprobado';
  }

  formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  }

  get approvalRate(): number {
    const s = this.stats();
    if (!s || s.totalSessions === 0) return 0;
    return Math.round((s.passedSessions / s.totalSessions) * 100);
  }
}
