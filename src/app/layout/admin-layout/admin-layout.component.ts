import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, ToastModule, ConfirmDialogModule],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  sidebarOpen = signal(false);
  currentUser = signal<User | null>(null);
  currentRoute = signal('');

  navItems = [
    { label: 'Dashboard', icon: 'pi pi-chart-bar', route: '/admin/dashboard' },
    { label: 'Usuarios', icon: 'pi pi-users', route: '/admin/users' },
    { label: 'Exámenes', icon: 'pi pi-book', route: '/admin/exams' },
    { label: 'Configuración', icon: 'pi pi-cog', route: '/admin/config' },
    { label: 'Pagos', icon: 'pi pi-credit-card', route: '/admin/payments' }
  ];

  ngOnInit(): void {
    this.currentUser.set(this.authService.getCurrentUser());
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.currentRoute.set(e.url);
    });
    this.currentRoute.set(this.router.url);
  }

  isActive(route: string): boolean {
    return this.currentRoute().startsWith(route);
  }

  navigate(route: string): void {
    this.router.navigate([route]);
    this.sidebarOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  toggleSidebar(): void {
    this.sidebarOpen.set(!this.sidebarOpen());
  }

  get userInitials(): string {
    const u = this.currentUser();
    if (!u) return 'A';
    return `${u.profile?.firstName?.[0] ?? '?'}${u.profile?.lastName?.[0] ?? ''}`.toUpperCase();
  }
}
