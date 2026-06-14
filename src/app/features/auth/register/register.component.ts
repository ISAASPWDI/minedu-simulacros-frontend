import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { Select } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirm = control.get('confirmPassword');
  if (password && confirm && password.value !== confirm.value) {
    confirm.setErrors({ mismatch: true });
    return { mismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ButtonModule, InputTextModule, PasswordModule, Select, ToastModule],
  providers: [MessageService],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  loading = false;

  escalaOptions = [
    { label: '1ra Escala', value: 'PRIMERA' },
    { label: '2da Escala', value: 'SEGUNDA' },
    { label: '3ra Escala', value: 'TERCERA' },
    { label: '4ta Escala', value: 'CUARTA' },
    { label: '5ta Escala', value: 'QUINTA' },
    { label: '6ta Escala', value: 'SEXTA' },
    { label: '7ma Escala', value: 'SEPTIMA' },
    { label: '8va Escala', value: 'OCTAVA' }
  ];

  specialtyOptions = [
    { label: 'Comunicación', value: 'COMUNICACION' },
    { label: 'Matemática', value: 'MATEMATICA' },
    { label: 'Ciencias Sociales', value: 'CIENCIAS_SOCIALES' },
    { label: 'Ciencia y Tecnología', value: 'CIENCIA_TECNOLOGIA' },
    { label: 'Arte y Cultura', value: 'ARTE_CULTURA' },
    { label: 'Educación Física', value: 'EDUCACION_FISICA' },
    { label: 'Inglés', value: 'INGLES' },
    { label: 'Educación Primaria', value: 'PRIMARIA' }
  ];

  form = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
    escalaMagisterial: ['', Validators.required],
    specialtyInterest: ['', Validators.required]
  }, { validators: passwordMatchValidator });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    const { confirmPassword, ...data } = this.form.value as any;
    this.authService.register(data).subscribe({
      next: () => {
        this.loading = false;
        this.messageService.add({ severity: 'success', summary: 'Registro exitoso', detail: 'Tu cuenta fue creada. Inicia sesión.' });
        setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error?.message || 'Error al registrarse';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
      }
    });
  }

  f(name: string) { return this.form.get(name); }
}
