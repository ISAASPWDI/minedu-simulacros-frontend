import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { Select } from 'primeng/select';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { User } from '../../../core/models/user.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, PasswordModule, Select, Tabs, TabList, Tab, TabPanels, TabPanel, ToastModule, PageHeaderComponent],
  providers: [MessageService],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private messageService = inject(MessageService);

  currentUser = signal<User | null>(null);
  saving = signal(false);
  changingPassword = signal(false);

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

  profileForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    dni: [''],
    phone: [''],
    region: [''],
    ugel: [''],
    institution: [''],
    escalaMagisterial: [''],
    specialtyInterest: [''],
    bio: ['']
  });

  passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  });

  ngOnInit(): void {
    const cached = this.authService.getCurrentUser();
    this.currentUser.set(cached);
    if (cached) this.patchForm(cached);

    // Always refresh from the server so previously-saved fields (region, ugel,
    // institution, bio, ...) are shown even if the login snapshot was stale.
    this.http.get<{ data: User }>(`${environment.apiUrl}/users/me`).subscribe({
      next: (res) => {
        if (res?.data) {
          this.currentUser.set(res.data);
          this.authService.updateStoredUser(res.data);
          this.patchForm(res.data);
        }
      },
      error: () => { /* keep cached values */ }
    });
  }

  private patchForm(user: User): void {
    this.profileForm.patchValue({
      firstName: user.profile?.firstName ?? '',
      lastName: user.profile?.lastName ?? '',
      dni: user.profile?.dni ?? '',
      phone: user.profile?.phone ?? '',
      region: user.profile?.region ?? '',
      ugel: user.profile?.ugel ?? '',
      institution: user.profile?.institution ?? '',
      escalaMagisterial: user.profile?.escalaMagisterial ?? '',
      specialtyInterest: user.profile?.specialtyInterest ?? '',
      bio: user.profile?.bio ?? ''
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: 'Campos requeridos', detail: 'Nombre y apellido son obligatorios.' });
      return;
    }
    this.saving.set(true);
    this.http.put<{ data: any }>(`${environment.apiUrl}/users/me/profile`, this.profileForm.value).subscribe({
      next: (res) => {
        this.saving.set(false);
        // Keep the cached user in sync with what was just saved.
        const user = this.currentUser();
        if (user && res?.data) {
          const updated: User = { ...user, profile: { ...(user.profile as any), ...res.data } };
          this.currentUser.set(updated);
          this.authService.updateStoredUser(updated);
        }
        this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Perfil actualizado correctamente.' });
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo actualizar el perfil.' });
      }
    });
  }

  changePassword(): void {
    const form = this.passwordForm.value;
    if (form.newPassword !== form.confirmPassword) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Las contraseñas no coinciden.' });
      return;
    }
    this.changingPassword.set(true);
    this.http.put(`${environment.apiUrl}/users/me/password`, { currentPassword: form.currentPassword, newPassword: form.newPassword }).subscribe({
      next: () => {
        this.changingPassword.set(false);
        this.passwordForm.reset();
        this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Contraseña cambiada correctamente.' });
      },
      error: (err) => {
        this.changingPassword.set(false);
        const msg = err.error?.message || 'No se pudo cambiar la contraseña.';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
      }
    });
  }
}

