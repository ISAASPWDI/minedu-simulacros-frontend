import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { PaymentService } from '../../../core/services/payment.service';
import { SubscriptionPlan, UserSubscription, PaymentOrder, YapeQrInfo } from '../../../core/models/payment.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TagModule, ToastModule, DialogModule, InputTextModule, TableModule, SkeletonModule, PageHeaderComponent],
  providers: [MessageService],
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.scss'
})
export class SubscriptionComponent implements OnInit {
  private paymentService = inject(PaymentService);
  private messageService = inject(MessageService);

  plans = signal<SubscriptionPlan[]>([]);
  subscription = signal<UserSubscription | null>(null);
  orders = signal<PaymentOrder[]>([]);
  yapeInfo = signal<YapeQrInfo | null>(null);
  loading = signal(true);

  selectedPlan = signal<SubscriptionPlan | null>(null);
  showPayDialog = signal(false);
  payNotes = signal('');
  creating = signal(false);
  createdOrder = signal<PaymentOrder | null>(null);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.paymentService.getSubscription().subscribe({
      next: (sub) => this.subscription.set(sub),
      error: () => this.subscription.set(null)
    });

    this.paymentService.getPlans().subscribe({
      next: (p) => { this.plans.set(p); this.loading.set(false); },
      error: () => this.loading.set(false)
    });

    this.paymentService.getUserOrders().subscribe({
      next: (page) => this.orders.set(page.content),
      error: () => {}
    });

    this.paymentService.getYapeInfo().subscribe({
      next: (info) => this.yapeInfo.set(info),
      error: () => {}
    });
  }

  selectPlan(plan: SubscriptionPlan): void {
    this.selectedPlan.set(plan);
    this.payNotes.set('');
    this.createdOrder.set(null);
    this.showPayDialog.set(true);
  }

  createOrder(): void {
    const plan = this.selectedPlan();
    if (!plan) return;
    this.creating.set(true);
    this.paymentService.createOrder(plan.id, this.payNotes()).subscribe({
      next: (order) => {
        this.creating.set(false);
        this.createdOrder.set(order);
        this.orders.update(o => [order, ...o]);
        this.messageService.add({ severity: 'success', summary: 'Pedido creado', detail: 'Tu pedido fue registrado. Realiza el pago por Yape y espera la confirmación.' });
      },
      error: (err) => {
        this.creating.set(false);
        const msg = err.error?.message || 'No se pudo crear el pedido';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
      }
    });
  }

  closeDialog(): void {
    this.showPayDialog.set(false);
    this.createdOrder.set(null);
  }

  getOrderStatusLabel(status: string): string {
    const map: Record<string, string> = { PENDING: 'Pendiente', CONFIRMED: 'Confirmado', REJECTED: 'Rechazado' };
    return map[status] ?? status;
  }

  getOrderSeverity(status: string): 'warn' | 'success' | 'danger' | 'secondary' {
    if (status === 'CONFIRMED') return 'success';
    if (status === 'REJECTED') return 'danger';
    return 'warn';
  }
}
