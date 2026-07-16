import { Component, ElementRef, Input, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { PaymentService } from '../../../../core/services/payment.service';
import { PaymentOrder } from '../../../../core/models/payment.model';

@Component({
  selector: 'app-pending-payments-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TableModule, TagModule, ToastModule, DialogModule, InputTextModule, TextareaModule, TooltipModule],
  providers: [MessageService],
  templateUrl: './pending-payments-panel.component.html',
  styleUrl: './pending-payments-panel.component.scss'
})
export class PendingPaymentsPanelComponent implements OnInit {
  /** When set, fetches only this many most-recent pending orders and hides pagination. */
  @Input() limit: number | null = null;
  @Input() pageSize = 10;

  @ViewChild('rejectImageInput') rejectImageInput!: ElementRef<HTMLInputElement>;

  private paymentService = inject(PaymentService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  orders = signal<PaymentOrder[]>([]);
  loading = signal(true);
  totalRecords = signal(0);
  currentPage = 0;

  showDetailDialog = signal(false);
  showConfirmDialog = signal(false);
  showRejectDialog = signal(false);
  selectedOrder = signal<PaymentOrder | null>(null);
  yapeReference = signal('');
  confirming = signal(false);
  rejecting = signal(false);
  uploadingRejectImage = signal(false);
  rejectImageUrl = signal<string | null>(null);
  rejectNotes = signal('');

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    const size = this.limit ?? this.pageSize;
    this.paymentService.getPendingOrdersPaged(this.currentPage, size).subscribe({
      next: (page) => {
        this.orders.set(page.content);
        this.totalRecords.set(page.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onPageChange(event: any): void {
    this.currentPage = event.rows ? event.first / event.rows : 0;
    this.loadOrders();
  }

  openDetail(order: PaymentOrder): void {
    this.selectedOrder.set(order);
    this.showDetailDialog.set(true);
  }

  openConfirm(order: PaymentOrder): void {
    this.selectedOrder.set(order);
    this.yapeReference.set('');
    this.showConfirmDialog.set(true);
  }

  openReject(order: PaymentOrder): void {
    this.selectedOrder.set(order);
    this.rejectImageUrl.set(null);
    this.rejectNotes.set('');
    this.showRejectDialog.set(true);
  }

  confirmPayment(): void {
    const order = this.selectedOrder();
    if (!order) return;
    this.confirmationService.confirm({
      header: 'Confirmar pago',
      message: `¿Confirmas el pago de ${order.userName || order.userEmail}? Esto activará su suscripción de inmediato.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, confirmar',
      rejectLabel: 'Cancelar',
      accept: () => this.doConfirmPayment(order)
    });
  }

  private doConfirmPayment(order: PaymentOrder): void {
    this.confirming.set(true);
    this.paymentService.confirmPayment(order.id, this.yapeReference()).subscribe({
      next: () => {
        this.confirming.set(false);
        this.showConfirmDialog.set(false);
        this.loadOrders();
        this.messageService.add({ severity: 'success', summary: 'Confirmado', detail: 'Pago confirmado y suscripción activada.' });
      },
      error: (err) => {
        this.confirming.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo confirmar el pago.' });
      }
    });
  }

  triggerRejectImageUpload(): void {
    this.rejectImageInput?.nativeElement.click();
  }

  onRejectImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingRejectImage.set(true);
    this.paymentService.uploadPaymentImage(file).subscribe({
      next: (url) => {
        this.uploadingRejectImage.set(false);
        this.rejectImageUrl.set(url);
      },
      error: () => {
        this.uploadingRejectImage.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo subir la imagen.' });
      }
    });
  }

  rejectPayment(): void {
    const order = this.selectedOrder();
    if (!order) return;
    this.confirmationService.confirm({
      header: 'Rechazar pago',
      message: `¿Rechazas el pago de ${order.userName || order.userEmail}? Se le notificará que reintente el pago.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, rechazar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectLabel: 'Cancelar',
      accept: () => this.doRejectPayment(order)
    });
  }

  private doRejectPayment(order: PaymentOrder): void {
    this.rejecting.set(true);
    this.paymentService.rejectPayment(order.id, this.rejectImageUrl() ?? undefined, this.rejectNotes() || undefined).subscribe({
      next: () => {
        this.rejecting.set(false);
        this.showRejectDialog.set(false);
        this.loadOrders();
        this.messageService.add({ severity: 'warn', summary: 'Rechazado', detail: 'El pago fue rechazado y se notificará al docente.' });
      },
      error: (err) => {
        this.rejecting.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo rechazar el pago.' });
      }
    });
  }

  getStatusSeverity(status: string): 'warn' | 'success' | 'danger' {
    if (status === 'COMPLETED') return 'success';
    if (status === 'FAILED' || status === 'REFUNDED') return 'danger';
    return 'warn';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = { PENDING: 'Pendiente', COMPLETED: 'Confirmado', FAILED: 'Rechazado', REFUNDED: 'Reembolsado' };
    return map[status] ?? status;
  }
}
