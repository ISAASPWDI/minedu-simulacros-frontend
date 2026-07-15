import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { PaymentService } from '../../../core/services/payment.service';
import { SubscriptionPlan, UserSubscription, PaymentOrder, YapeQrInfo } from '../../../core/models/payment.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TagModule, ToastModule, DialogModule,
    InputTextModule, TextareaModule, TableModule, SkeletonModule, PageHeaderComponent],
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
  totalOrders = signal(0);
  orderPageSize = 5;
  orderPage = 0;
  yapeInfo = signal<YapeQrInfo | null>(null);
  loading = signal(true);

  selectedPlan = signal<SubscriptionPlan | null>(null);
  showPayDialog = signal(false);
  payNotes = signal('');
  payImageUrl = signal<string | null>(null);
  uploadingImage = signal(false);
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

    this.loadOrders();

    this.paymentService.getYapeInfo().subscribe({
      next: (info) => this.yapeInfo.set(info),
      error: () => {}
    });
  }

  loadOrders(): void {
    this.paymentService.getUserOrdersPaged(this.orderPage, this.orderPageSize).subscribe({
      next: (page) => {
        this.orders.set(page.content);
        this.totalOrders.set(page.totalElements);
      },
      error: () => {}
    });
  }

  onOrdersPageChange(event: any): void {
    this.orderPage = event.rows ? event.first / event.rows : 0;
    this.loadOrders();
  }

  get daysRemaining(): number {
    const sub = this.subscription();
    if (!sub) return 0;
    const diff = new Date(sub.expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  get hasPendingOrder(): boolean {
    return this.orders().some(o => o.status === 'PENDING');
  }

  selectPlan(plan: SubscriptionPlan): void {
    if (this.hasPendingOrder) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Pedido pendiente',
        detail: 'Ya tienes un pedido pendiente de pago. Espera la respuesta del administrador antes de solicitar otro.'
      });
      return;
    }
    this.selectedPlan.set(plan);
    this.payNotes.set('');
    this.payImageUrl.set(null);
    this.createdOrder.set(null);
    this.showPayDialog.set(true);
  }

  triggerImageUpload(): void {
    const input = document.getElementById('paymentImageInput') as HTMLInputElement;
    input?.click();
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingImage.set(true);
    this.paymentService.uploadPaymentImage(file).subscribe({
      next: (url) => {
        this.uploadingImage.set(false);
        this.payImageUrl.set(url);
        this.messageService.add({ severity: 'success', summary: 'Imagen subida', detail: 'Comprobante de pago adjuntado.' });
      },
      error: () => {
        this.uploadingImage.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo subir la imagen.' });
      }
    });
  }

  createOrder(): void {
    const plan = this.selectedPlan();
    if (!plan) return;
    this.creating.set(true);
    this.paymentService.createOrder(plan.id, this.payNotes() || undefined, this.payImageUrl() || undefined).subscribe({
      next: (order) => {
        this.creating.set(false);
        this.createdOrder.set(order);
        this.orderPage = 0;
        this.loadOrders();
        this.messageService.add({ severity: 'success', summary: 'Pedido creado', detail: 'Tu pedido fue registrado. Un administrador confirmará el pago en breve.' });
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

  parseFeatures(featuresJson: string): string[] {
    if (!featuresJson) return [];
    try {
      const obj = typeof featuresJson === 'string' ? JSON.parse(featuresJson) : featuresJson;
      const labels: string[] = [];
      if (obj.years === 'all') labels.push('Todos los años de exámenes');
      else if (obj.years) labels.push(`${obj.years} año${obj.years > 1 ? 's' : ''} de exámenes`);
      if (obj.simulacros) labels.push('Acceso a simulacros');
      if (obj.historial) labels.push('Historial de resultados');
      if (obj.estadisticas) labels.push('Estadísticas detalladas');
      if (obj.exportar) labels.push('Exportar resultados');
      return labels;
    } catch {
      return [];
    }
  }

  getOrderStatusLabel(status: string): string {
    const map: Record<string, string> = { PENDING: 'Pendiente', COMPLETED: 'Confirmado', FAILED: 'Rechazado', REFUNDED: 'Reembolsado' };
    return map[status] ?? status;
  }

  getOrderSeverity(status: string): 'warn' | 'success' | 'danger' | 'secondary' {
    if (status === 'COMPLETED') return 'success';
    if (status === 'FAILED' || status === 'REFUNDED') return 'danger';
    return 'warn';
  }
}
