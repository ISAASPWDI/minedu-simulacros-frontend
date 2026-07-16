import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { NotifyAdminButtonComponent } from '../../../shared/components/notify-admin-button/notify-admin-button.component';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, NotifyAdminButtonComponent],
  templateUrl: './help.component.html',
  styleUrl: './help.component.scss'
})
export class HelpComponent {}
