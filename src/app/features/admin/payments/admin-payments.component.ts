import { Component } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { PendingPaymentsPanelComponent } from './pending-payments-panel/pending-payments-panel.component';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [PageHeaderComponent, PendingPaymentsPanelComponent],
  templateUrl: './admin-payments.component.html',
  styleUrl: './admin-payments.component.scss'
})
export class AdminPaymentsComponent {}
