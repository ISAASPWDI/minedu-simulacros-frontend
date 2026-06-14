import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h1>{{ title }}</h1>
      <div class="breadcrumb" *ngIf="breadcrumb">
        <span *ngFor="let item of breadcrumb; let last = last">
          {{ item }}<span *ngIf="!last"> / </span>
        </span>
      </div>
    </div>
  `
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() breadcrumb: string[] = [];
}
