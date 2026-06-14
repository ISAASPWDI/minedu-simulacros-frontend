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
import { PageResponse } from '../../../core/models/config.model';
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

    this.http.get<PageResponse<any>>(`${environment.apiUrl}/users?page=0&size=1`).subscribe({
      next: (page) => this.totalUsers.set(page.totalElements),
      error: () => {}
    });

    this.paymentService.getPendingOrders().subscribe({
      next: (orders) => {
        this.pendingPayments.set(orders.length);
        this.recentOrders.set(orders.slice(0, 5));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  goTo(path: string): void {
    this.router.navigate([path]);
  }
}
