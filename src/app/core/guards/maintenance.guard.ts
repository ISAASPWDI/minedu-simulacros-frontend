import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { PlatformService } from '../services/platform.service';

export const maintenanceGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const platformService = inject(PlatformService);
  const router = inject(Router);

  if (!authService.isTeacher()) {
    return true;
  }

  return platformService.getInfo().pipe(
    map(info => info.maintenanceMode ? router.createUrlTree(['/maintenance']) : true),
    catchError(() => of(true))
  );
};
