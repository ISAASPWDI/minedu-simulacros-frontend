import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ButtonModule, InputTextModule, ToastModule],
  providers: [MessageService],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss'
})
export class VerifyEmailComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  loading = false;
  resending = signal(false);
  email = signal('');

  form = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]]
  });

  ngOnInit(): void {
    this.email.set(this.route.snapshot.queryParamMap.get('email') ?? '');
  }

  submit(): void {
    if (this.form.invalid || !this.email()) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.authService.verifyEmail(this.email(), this.form.value.code!).subscribe({
      next: () => {
        this.loading = false;
        this.messageService.add({ severity: 'success', summary: 'Correo verificado', detail: 'Ya puedes iniciar sesión.' });
        setTimeout(() => this.router.navigate(['/auth/login']), 1500);
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error?.message || 'Código inválido o expirado';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
      }
    });
  }

  resend(): void {
    if (!this.email()) return;
    this.resending.set(true);
    this.authService.resendVerification(this.email()).subscribe({
      next: () => {
        this.resending.set(false);
        this.messageService.add({ severity: 'success', summary: 'Código reenviado', detail: 'Revisa tu bandeja de entrada o la carpeta de spam.' });
      },
      error: (err) => {
        this.resending.set(false);
        const msg = err.error?.message || 'No se pudo reenviar el código';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
      }
    });
  }

  get codeControl() { return this.form.get('code'); }
}
