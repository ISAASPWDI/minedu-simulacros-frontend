import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Select } from 'primeng/select';
import { PaginatorModule } from 'primeng/paginator';
import { TooltipModule } from 'primeng/tooltip';
import { SimulationService } from '../../../core/services/simulation.service';
import { SessionSummary, UserStats } from '../../../core/models/simulation.model';
import { EscalaPipe } from '../../../shared/pipes/escala.pipe';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TableModule, TagModule, Select, PaginatorModule, TooltipModule, EscalaPipe, PageHeaderComponent],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent implements OnInit {
  private simulationService = inject(SimulationService);
  private router = inject(Router);

  allSessions = signal<SessionSummary[]>([]);
  stats = signal<UserStats | null>(null);
  loading = signal(true);
  pageSize = 10;
  currentPage = signal(0);

  filterStatus = signal<string | null>(null);

  statusOptions = [
    { label: 'Todos', value: null },
    { label: 'En curso', value: 'IN_PROGRESS' },
    { label: 'Aprobado', value: 'COMPLETED_PASSED' },
    { label: 'Desaprobado', value: 'COMPLETED_FAILED' },
    { label: 'Abandonado', value: 'ABANDONED' }
  ];

  filteredSessions = computed(() => {
    const status = this.filterStatus();
    if (!status) return this.allSessions();
    return this.allSessions().filter(s => s.status === status);
  });

  pagedSessions = computed(() => {
    const page = this.currentPage();
    const start = page * this.pageSize;
    return this.filteredSessions().slice(start, start + this.pageSize);
  });

  totalRecords = computed(() => this.filteredSessions().length);

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
    this.simulationService.getHistory(0, 200).subscribe({
      next: (page) => {
        this.allSessions.set(page.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onPageChange(event: any): void {
    this.currentPage.set(event.page);
  }

  viewResult(sessionId: string): void {
    this.router.navigate(['/teacher/results', sessionId]);
  }

  resumeSession(sessionId: string): void {
    this.router.navigate(['/teacher/simulation', sessionId]);
  }

  getStatusSeverity(passed: boolean, status: string): 'success' | 'danger' | 'secondary' | 'warn' {
    if (status === 'IN_PROGRESS') return 'warn';
    if (status === 'ABANDONED') return 'secondary';
    return passed ? 'success' : 'danger';
  }

  getStatusLabel(passed: boolean, status: string): string {
    if (status === 'IN_PROGRESS') return 'En curso';
    if (status === 'ABANDONED') return 'Abandonado';
    return passed ? 'Aprobado' : 'Desaprobado';
  }

  formatDuration(startedAt: string, finishedAt: string): string {
    const secs = Math.floor((new Date(finishedAt).getTime() - new Date(startedAt).getTime()) / 1000);
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  }

  get approvalRate(): number {
    const s = this.stats();
    if (!s || s.totalExams === 0) return 0;
    return Math.round((s.totalPassed / s.totalExams) * 100);
  }
}
