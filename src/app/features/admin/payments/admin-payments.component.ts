import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { PaymentService } from '../../../core/services/payment.service';
import { PaymentOrder } from '../../../core/models/payment.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TableModule, TagModule, ToastModule, DialogModule, InputTextModule, Select, PageHeaderComponent],
  providers: [MessageService],
  templateUrl: './admin-payments.component.html',
  styleUrl: './admin-payments.component.scss'
})
export class AdminPaymentsComponent implements OnInit {
  private paymentService = inject(PaymentService);
  private messageService = inject(MessageService);

  orders = signal<PaymentOrder[]>([]);
  totalRecords = signal(0);
  loading = signal(true);
  filterStatus = signal<string | undefined>(undefined);
  currentPage = 0;
  pageSize = 15;

  showConfirmDialog = signal(false);
  selectedOrder = signal<PaymentOrder | null>(null);
  yapeReference = signal('');
  confirming = signal(false);

  showRejectDialog = signal(false);
  rejectReason = signal('');
  rejecting = signal(false);

  statusOptions = [
    { label: 'Todos', value: undefined },
    { label: 'Pendiente', value: 'PENDING' },
    { label: 'Confirmado', value: 'CONFIRMED' },
    { label: 'Rechazado', value: 'REJECTED' }
  ];

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.paymentService.getAllOrders(this.currentPage, this.pageSize, this.filterStatus()).subscribe({
      next: (page) => {
        this.orders.set(page.content);
        this.totalRecords.set(page.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadOrders();
  }

  onPageChange(event: any): void {
    this.currentPage = event.first / event.rows;
    this.loadOrders();
  }

  openConfirm(order: PaymentOrder): void {
    this.selectedOrder.set(order);
    this.yapeReference.set('');
    this.showConfirmDialog.set(true);
  }

  confirmPayment(): void {
    const order = this.selectedOrder();
    if (!order) return;
    this.confirming.set(true);
    this.paymentService.confirmPayment(order.id, this.yapeReference()).subscribe({
      next: (updated) => {
        this.confirming.set(false);
        this.showConfirmDialog.set(false);
        this.orders.update(list => list.map(o => o.id === updated.id ? updated : o));
        this.messageService.add({ severity: 'success', summary: 'Confirmado', detail: 'Pago confirmado y suscripción activada.' });
      },
      error: (err) => {
        this.confirming.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo confirmar el pago.' });
      }
    });
  }

  openReject(order: PaymentOrder): void {
    this.selectedOrder.set(order);
    this.rejectReason.set('');
    this.showRejectDialog.set(true);
  }

  rejectPayment(): void {
    const order = this.selectedOrder();
    if (!order) return;
    this.rejecting.set(true);
    this.paymentService.rejectPayment(order.id, this.rejectReason()).subscribe({
      next: (updated) => {
        this.rejecting.set(false);
        this.showRejectDialog.set(false);
        this.orders.update(list => list.map(o => o.id === updated.id ? updated : o));
        this.messageService.add({ severity: 'warn', summary: 'Rechazado', detail: 'El pago fue rechazado.' });
      },
      error: (err) => {
        this.rejecting.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo rechazar el pago.' });
      }
    });
  }

  getStatusSeverity(status: string): 'warn' | 'success' | 'danger' {
    if (status === 'CONFIRMED') return 'success';
    if (status === 'REJECTED') return 'danger';
    return 'warn';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = { PENDING: 'Pendiente', CONFIRMED: 'Confirmado', REJECTED: 'Rechazado' };
    return map[status] ?? status;
  }
}
