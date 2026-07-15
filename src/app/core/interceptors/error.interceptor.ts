import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { MessageService } from 'primeng/api';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const wasLoggedIn = authService.getCurrentUser() !== null;
        authService.logout();
        router.navigate(['/auth/login']);
        if (wasLoggedIn) {
          messageService.add({
            severity: 'warn',
            summary: 'Sesión finalizada',
            detail: error.error?.message || 'Tu sesión ha finalizado. Inicia sesión nuevamente.'
          });
        }
      } else if (error.status === 403) {
        messageService.add({ severity: 'error', summary: 'Sin permisos', detail: 'No tienes permisos para realizar esta acción.' });
      } else if (error.status === 0) {
        messageService.add({ severity: 'error', summary: 'Sin conexión', detail: 'No se pudo conectar con el servidor.' });
      } else if (error.status >= 500) {
        messageService.add({ severity: 'error', summary: 'Error del servidor', detail: 'Ocurrió un error interno. Intenta nuevamente.' });
      }
      return throwError(() => error);
    })
  );
};
