import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ToastModule } from 'primeng/toast';
import { PlatformService } from './core/services/platform.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private titleService = inject(Title);
  private platformService = inject(PlatformService);

  protected readonly title = signal('minedu-simulacros-frontend');

  ngOnInit(): void {
    this.platformService.getInfo().subscribe({
      next: (info) => this.titleService.setTitle(info.name),
      error: () => {}
    });
  }
}
