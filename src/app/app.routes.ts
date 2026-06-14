import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      }
    ]
  },
  {
    path: 'teacher',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/teacher-layout/teacher-layout.component').then(m => m.TeacherLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/teacher/dashboard/teacher-dashboard.component').then(m => m.TeacherDashboardComponent)
      },
      {
        path: 'exams',
        loadComponent: () => import('./features/teacher/exam-selection/exam-selection.component').then(m => m.ExamSelectionComponent)
      },
      {
        path: 'simulation/:sessionId',
        loadComponent: () => import('./features/teacher/simulation/simulation.component').then(m => m.SimulationComponent)
      },
      {
        path: 'results/:sessionId',
        loadComponent: () => import('./features/teacher/results/results.component').then(m => m.ResultsComponent)
      },
      {
        path: 'history',
        loadComponent: () => import('./features/teacher/history/history.component').then(m => m.HistoryComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/teacher/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'subscription',
        loadComponent: () => import('./features/teacher/subscription/subscription.component').then(m => m.SubscriptionComponent)
      }
    ]
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users/admin-users.component').then(m => m.AdminUsersComponent)
      },
      {
        path: 'exams',
        loadComponent: () => import('./features/admin/exams/admin-exams.component').then(m => m.AdminExamsComponent)
      },
      {
        path: 'config',
        loadComponent: () => import('./features/admin/config/admin-config.component').then(m => m.AdminConfigComponent)
      },
      {
        path: 'payments',
        loadComponent: () => import('./features/admin/payments/admin-payments.component').then(m => m.AdminPaymentsComponent)
      }
    ]
  }
];
