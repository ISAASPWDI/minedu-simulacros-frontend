import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AuthService } from '../../core/services/auth.service';
import { PaymentService } from '../../core/services/payment.service';
import { UserSubscription } from '../../core/models/payment.model';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-teacher-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, BadgeModule, ToastModule, ConfirmDialogModule],
  templateUrl: './teacher-layout.component.html',
  styleUrl: './teacher-layout.component.scss'
})
export class TeacherLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private paymentService = inject(PaymentService);
  private router = inject(Router);

  sidebarOpen = signal(false);
  currentUser = signal<User | null>(null);
  subscription = signal<UserSubscription | null>(null);
  currentRoute = signal('');

  navItems = [
    { label: 'Dashboard', icon: 'pi pi-home', route: '/teacher/dashboard' },
    { label: 'Mis Exámenes', icon: 'pi pi-book', route: '/teacher/exams' },
    { label: 'Mi Historial', icon: 'pi pi-history', route: '/teacher/history' },
    { label: 'Mi Perfil', icon: 'pi pi-user', route: '/teacher/profile' },
    { label: 'Suscripción', icon: 'pi pi-credit-card', route: '/teacher/subscription' }
  ];

  ngOnInit(): void {
    this.currentUser.set(this.authService.getCurrentUser());
    this.loadSubscription();
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.currentRoute.set(e.url);
    });
    this.currentRoute.set(this.router.url);
  }

  loadSubscription(): void {
    this.paymentService.getSubscription().subscribe({
      next: (sub) => this.subscription.set(sub),
      error: () => this.subscription.set(null)
    });
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
    if (!u) return '?';
    return `${u.profile?.firstName?.[0] ?? '?'}${u.profile?.lastName?.[0] ?? ''}`.toUpperCase();
  }

  get hasActiveSubscription(): boolean {
    return this.subscription()?.isActive === true;
  }
}
