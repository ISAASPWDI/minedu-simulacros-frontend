import { Injectable, inject, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';
import { filter } from 'rxjs/operators';

/**
 * Tracks the in-app navigation stack so a global back button can walk the
 * history recursively (step by step towards the start) without ever leaving
 * the SPA. Falls back to a sensible default when the stack is empty.
 */
@Injectable({ providedIn: 'root' })
export class NavigationHistoryService {
  private router = inject(Router);
  private location = inject(Location);

  private stack: string[] = [];
  private initialized = false;
  /** Exposed so the back button can hide itself when there's nowhere to go. */
  readonly canGoBack = signal(false);

  init(): void {
    if (this.initialized) return;
    this.initialized = true;
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        const url = e.urlAfterRedirects;
        // Ignore repeated entries for the same URL (e.g. lazy reloads).
        if (this.stack[this.stack.length - 1] !== url) {
          this.stack.push(url);
        }
        this.canGoBack.set(this.stack.length > 1);
      });
  }

  back(fallback = '/'): void {
    if (this.stack.length > 1) {
      this.stack.pop();               // drop current
      const previous = this.stack[this.stack.length - 1];
      // Keep the browser history in sync so the native back button matches.
      this.location.back();
      // Guard: if location.back didn't move (direct entry), route explicitly.
      setTimeout(() => {
        if (this.router.url !== previous) {
          this.router.navigateByUrl(previous);
        }
      }, 50);
    } else {
      this.router.navigateByUrl(fallback);
    }
    this.canGoBack.set(this.stack.length > 1);
  }
}
