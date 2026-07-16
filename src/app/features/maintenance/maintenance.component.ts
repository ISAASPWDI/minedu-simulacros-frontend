import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../core/services/auth.service';
import { PlatformService } from '../../core/services/platform.service';
import { NotifyAdminButtonComponent } from '../../shared/components/notify-admin-button/notify-admin-button.component';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [CommonModule, ButtonModule, NotifyAdminButtonComponent],
  templateUrl: './maintenance.component.html',
  styleUrl: './maintenance.component.scss'
})
export class MaintenanceComponent {
  private authService = inject(AuthService);
  private platformService = inject(PlatformService);
  private router = inject(Router);

  checking = signal(false);

  retry(): void {
    this.checking.set(true);
    this.platformService.getInfo().subscribe({
      next: (info) => {
        this.checking.set(false);
        if (!info.maintenanceMode) {
          this.router.navigate(['/teacher/dashboard']);
        }
      },
      error: () => this.checking.set(false)
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
