import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notify-admin-button',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, DialogModule, TextareaModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast />
    <button
      pButton
      type="button"
      [label]="label"
      icon="pi pi-send"
      severity="secondary"
      text
      (click)="open()"
    ></button>

    <p-dialog
      header="Notificar al administrador"
      [visible]="showDialog()"
      (visibleChange)="showDialog.set($event)"
      [modal]="true"
      [style]="{ width: '420px' }"
    >
      <p class="hint">Cuéntanos qué necesitas y le avisaremos al administrador por correo.</p>
      <textarea
        pTextarea
        rows="4"
        class="w-full"
        placeholder="Describe brevemente tu situación (opcional)..."
        [ngModel]="message()"
        (ngModelChange)="message.set($event)"
      ></textarea>
      <ng-template pTemplate="footer">
        <button pButton label="Cancelar" severity="secondary" text (click)="showDialog.set(false)"></button>
        <button pButton label="Enviar" icon="pi pi-send" [loading]="sending()" (click)="send()"></button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    :host {
      display: contents;
    }

    .hint {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-bottom: 0.75rem;
    }
  `]
})
export class NotifyAdminButtonComponent {
  private notificationService = inject(NotificationService);
  private messageService = inject(MessageService);

  @Input() label = 'Notificar al administrador';
  @Input() defaultMessage = '';

  showDialog = signal(false);
  message = signal('');
  sending = signal(false);

  open(): void {
    this.message.set(this.defaultMessage);
    this.showDialog.set(true);
  }

  send(): void {
    this.sending.set(true);
    this.notificationService.notifyAdmin(this.message()).subscribe({
      next: () => {
        this.sending.set(false);
        this.showDialog.set(false);
        this.messageService.add({ severity: 'success', summary: 'Enviado', detail: 'Se notificó al administrador.' });
      },
      error: () => {
        this.sending.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo enviar la notificación.' });
      }
    });
  }
}
