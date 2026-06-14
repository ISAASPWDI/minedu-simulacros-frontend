import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { environment } from '../../../../environments/environment';
import { User } from '../../../core/models/user.model';
import { PageResponse } from '../../../core/models/config.model';
import { EscalaPipe } from '../../../shared/pipes/escala.pipe';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ButtonModule, TableModule, TagModule, ToastModule, InputTextModule, SkeletonModule, TooltipModule, EscalaPipe, PageHeaderComponent],
  providers: [MessageService],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss'
})
export class AdminUsersComponent implements OnInit {
  private http = inject(HttpClient);
  private messageService = inject(MessageService);

  users = signal<User[]>([]);
  totalRecords = signal(0);
  loading = signal(true);
  toggling = signal<string | null>(null);
  currentPage = 0;
  pageSize = 15;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    const params = new HttpParams()
      .set('page', this.currentPage.toString())
      .set('size', this.pageSize.toString());

    this.http.get<PageResponse<User>>(`${environment.apiUrl}/users`, { params }).subscribe({
      next: (page) => {
        this.users.set(page.content);
        this.totalRecords.set(page.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  toggleActive(user: User): void {
    this.toggling.set(user.id);
    this.http.put<User>(`${environment.apiUrl}/users/${user.id}/toggle-active`, {}).subscribe({
      next: (updated) => {
        this.toggling.set(null);
        this.users.update(list => list.map(u => u.id === updated.id ? updated : u));
        const label = updated.isActive ? 'activado' : 'desactivado';
        this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: `Usuario ${label} correctamente.` });
      },
      error: () => {
        this.toggling.set(null);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cambiar el estado del usuario.' });
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
}
