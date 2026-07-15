import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { ExamService } from '../../../core/services/exam.service';
import { PaymentService } from '../../../core/services/payment.service';
import { environment } from '../../../../environments/environment';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { PaymentOrder } from '../../../core/models/payment.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule, SkeletonModule, PageHeaderComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  private examService = inject(ExamService);
  private paymentService = inject(PaymentService);
  private http = inject(HttpClient);
  private router = inject(Router);

  totalExams = signal(0);
  totalUsers = signal(0);
  pendingPayments = signal(0);
  loading = signal(true);
  recentOrders = signal<PaymentOrder[]>([]);

  ngOnInit(): void {
    this.examService.getExams({ size: 1 }).subscribe({
      next: (page) => this.totalExams.set(page.totalElements),
      error: () => {}
    });

    this.http.get<{ data: number }>(`${environment.apiUrl}/users/count?role=TEACHER`).subscribe({
      next: (res) => this.totalUsers.set(res.data ?? 0),
      error: () => this.totalUsers.set(0)
    });

    // Latest pending payments first (sorted by createdAt DESC on the backend).
    this.paymentService.getPendingOrdersPaged(0, 5).subscribe({
      next: (page) => {
        this.pendingPayments.set(page.totalElements);
        this.recentOrders.set(page.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  goTo(path: string): void {
    this.router.navigate([path]);
  }
}
