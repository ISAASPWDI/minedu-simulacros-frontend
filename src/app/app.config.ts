import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';
import { MessageService, ConfirmationService } from 'primeng/api';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

const SimulacrosPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#fff8f5',
      100: '#ffeee5',
      200: '#ffd5c0',
      300: '#ffb08e',
      400: '#ff7a50',
      500: '#ff5724',
      600: '#ee3d0c',
      700: '#c72f09',
      800: '#9e2609',
      900: '#7e220a',
      950: '#430e04'
    }
  }
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: SimulacrosPreset,
        options: {
          darkModeSelector: 'none',
          cssLayer: false
        }
      }
    }),
    MessageService,
    ConfirmationService
  ]
};
