import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('newPassword');
  const confirm = control.get('confirmPassword');
  if (password && confirm && password.value !== confirm.value) {
    confirm.setErrors({ mismatch: true });
    return { mismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ButtonModule, InputTextModule, PasswordModule, ToastModule],
  providers: [MessageService],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  loading = false;
  resending = signal(false);
  email = signal('');

  form = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatchValidator });

  ngOnInit(): void {
    this.email.set(this.route.snapshot.queryParamMap.get('email') ?? '');
  }

  submit(): void {
    if (this.form.invalid || !this.email()) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    const { code, newPassword } = this.form.value;
    this.authService.resetPassword(this.email(), code!, newPassword!).subscribe({
      next: () => {
        this.loading = false;
        this.messageService.add({ severity: 'success', summary: 'Contraseña actualizada', detail: 'Ya puedes iniciar sesión con tu nueva contraseña.' });
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
    this.authService.forgotPassword(this.email()).subscribe({
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
  get newPasswordControl() { return this.form.get('newPassword'); }
  get confirmPasswordControl() { return this.form.get('confirmPassword'); }
}
