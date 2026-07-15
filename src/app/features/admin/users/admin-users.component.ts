import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { PageResponse } from '../../../core/models/config.model';
import { EscalaPipe } from '../../../shared/pipes/escala.pipe';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

interface UserFormValue {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dni: string;
  phone: string;
  escalaMagisterial: string;
  specialtyInterest: string;
  role: string;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TableModule, TagModule, ToastModule, DialogModule,
    InputTextModule, SelectModule, SkeletonModule, TooltipModule, ConfirmDialogModule, EscalaPipe, PageHeaderComponent],
  providers: [MessageService, ConfirmationService],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss'
})
export class AdminUsersComponent implements OnInit {
  private http = inject(HttpClient);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private authService = inject(AuthService);

  users = signal<User[]>([]);
  totalRecords = signal(0);
  loading = signal(true);
  toggling = signal<string | null>(null);
  currentPage = 0;
  pageSize = 15;

  currentUserId = this.authService.getCurrentUser()?.id ?? null;

  // Create user
  showCreateDialog = signal(false);
  creating = signal(false);
  newUser = signal<UserFormValue>(this.emptyForm());

  // Edit user
  showEditDialog = signal(false);
  editingUser = signal<User | null>(null);
  editForm = signal<Omit<UserFormValue, 'email' | 'password'>>(this.emptyForm());
  savingEdit = signal(false);

  roleOptions = [
    { label: 'Docente', value: 'TEACHER' },
    { label: 'Administrador', value: 'ADMIN' }
  ];

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

  private emptyForm(): UserFormValue {
    return { firstName: '', lastName: '', email: '', password: '', dni: '', phone: '', escalaMagisterial: '', specialtyInterest: '', role: 'TEACHER' };
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    const params = new HttpParams()
      .set('page', this.currentPage.toString())
      .set('size', this.pageSize.toString());

    this.http.get<{ data: PageResponse<User> }>(`${environment.apiUrl}/users`, { params }).subscribe({
      next: (res) => {
        this.users.set(res.data.content);
        this.totalRecords.set(res.data.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  isCurrentUser(user: User): boolean {
    return !!this.currentUserId && user.id === this.currentUserId;
  }

  toggleActive(user: User): void {
    this.toggling.set(user.id);
    this.http.put<{ data: User }>(`${environment.apiUrl}/users/${user.id}/toggle-active`, {}).subscribe({
      next: (res) => {
        const updated = res.data;
        this.toggling.set(null);
        this.users.update(list => list.map(u => u.id === updated.id ? updated : u));
        const label = updated.isActive ? 'activado' : 'desactivado';
        this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: `Usuario ${label} correctamente.` });
      },
      error: (err) => {
        this.toggling.set(null);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo cambiar el estado del usuario.' });
      }
    });
  }

  openCreate(): void {
    this.newUser.set(this.emptyForm());
    this.showCreateDialog.set(true);
  }

  createUser(): void {
    const u = this.newUser();
    if (!u.email || !u.password || !u.firstName || !u.lastName || !u.dni || !u.escalaMagisterial) {
      this.messageService.add({ severity: 'warn', summary: 'Campos requeridos', detail: 'Completa nombre, apellido, email, contraseña, DNI y escala magisterial.' });
      return;
    }
    this.creating.set(true);
    this.http.post<{ data: User }>(`${environment.apiUrl}/users`, u).subscribe({
      next: (res) => {
        this.creating.set(false);
        this.showCreateDialog.set(false);
        this.users.update(list => [res.data, ...list]);
        this.totalRecords.update(n => n + 1);
        this.messageService.add({ severity: 'success', summary: 'Creado', detail: 'Usuario creado correctamente.' });
      },
      error: (err) => {
        this.creating.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo crear el usuario.' });
      }
    });
  }

  openEditDialog(user: User): void {
    this.editingUser.set(user);
    this.editForm.set({
      firstName: user.profile?.firstName ?? '',
      lastName: user.profile?.lastName ?? '',
      dni: user.profile?.dni ?? '',
      phone: user.profile?.phone ?? '',
      escalaMagisterial: user.profile?.escalaMagisterial ?? '',
      specialtyInterest: user.profile?.specialtyInterest ?? '',
      role: user.role
    });
    this.showEditDialog.set(true);
  }

  saveEdit(): void {
    const user = this.editingUser();
    if (!user) return;
    const form = this.editForm();
    if (!form.firstName || !form.lastName || !form.dni || !form.escalaMagisterial) {
      this.messageService.add({ severity: 'warn', summary: 'Campos requeridos', detail: 'Nombre, apellido, DNI y escala magisterial son obligatorios.' });
      return;
    }
    this.savingEdit.set(true);
    this.http.put<{ data: User }>(`${environment.apiUrl}/users/${user.id}`, form).subscribe({
      next: (res) => {
        this.savingEdit.set(false);
        this.showEditDialog.set(false);
        this.users.update(list => list.map(u => u.id === res.data.id ? res.data : u));
        this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Usuario actualizado correctamente.' });
      },
      error: (err) => {
        this.savingEdit.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo actualizar el usuario.' });
      }
    });
  }

  confirmDelete(user: User): void {
    if (this.isCurrentUser(user)) {
      this.messageService.add({ severity: 'warn', summary: 'Acción no permitida', detail: 'No puedes eliminar tu propia cuenta.' });
      return;
    }
    this.confirmationService.confirm({
      message: `¿Eliminar al usuario ${user.email}? Esta acción no se puede deshacer.`,
      header: 'Eliminar Usuario',
      icon: 'pi pi-trash',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteUser(user)
    });
  }

  deleteUser(user: User): void {
    this.http.delete<{ data: null }>(`${environment.apiUrl}/users/${user.id}`).subscribe({
      next: () => {
        this.users.update(list => list.filter(u => u.id !== user.id));
        this.totalRecords.update(n => n - 1);
        this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Usuario eliminado correctamente.' });
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo eliminar el usuario.' });
      }
    });
  }

  onPageChange(event: any): void {
    this.currentPage = event.first / event.rows;
    this.loadUsers();
  }

  getRoleSeverity(role: string): 'info' | 'warn' {
    return role === 'ADMIN' ? 'warn' : 'info';
  }

  getRoleLabel(role: string): string {
    return role === 'ADMIN' ? 'Admin' : 'Docente';
  }
}
