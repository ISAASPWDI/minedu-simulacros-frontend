import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { PaymentService } from '../../../core/services/payment.service';
import { PaymentOrder } from '../../../core/models/payment.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TableModule, TagModule, ToastModule, DialogModule, InputTextModule, PageHeaderComponent],
  providers: [MessageService],
  templateUrl: './admin-payments.component.html',
  styleUrl: './admin-payments.component.scss'
})
export class AdminPaymentsComponent implements OnInit {
  private paymentService = inject(PaymentService);
  private messageService = inject(MessageService);

  orders = signal<PaymentOrder[]>([]);
  loading = signal(true);

  showConfirmDialog = signal(false);
  selectedOrder = signal<PaymentOrder | null>(null);
  yapeReference = signal('');
  confirming = signal(false);

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.paymentService.getPendingOrders().subscribe({
      next: (orders) => { this.orders.set(orders); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
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
        this.orders.update(list => list.filter(o => o.id !== updated.id));
        this.messageService.add({ severity: 'success', summary: 'Confirmado', detail: 'Pago confirmado y suscripción activada.' });
      },
      error: (err) => {
        this.confirming.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo confirmar el pago.' });
      }
    });
  }

  getStatusSeverity(status: string): 'warn' | 'success' | 'danger' {
    if (status === 'COMPLETED') return 'success';
    if (status === 'FAILED' || status === 'REFUNDED') return 'danger';
    return 'warn';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = { PENDING: 'Pendiente', COMPLETED: 'Confirmado', FAILED: 'Fallido', REFUNDED: 'Reembolsado' };
    return map[status] ?? status;
  }
}
