import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { ConfigService } from '../../../core/services/config.service';
import { SystemConfig } from '../../../core/models/config.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

interface EditableConfig extends SystemConfig {
  editing: boolean;
  editValue: string;
  saving: boolean;
}

@Component({
  selector: 'app-admin-config',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, ToastModule, SkeletonModule, ToggleSwitch, TagModule, PageHeaderComponent],
  providers: [MessageService],
  templateUrl: './admin-config.component.html',
  styleUrl: './admin-config.component.scss'
})
export class AdminConfigComponent implements OnInit {
  private configService = inject(ConfigService);
  private messageService = inject(MessageService);

  configs = signal<EditableConfig[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.loadConfigs();
  }

  loadConfigs(): void {
    this.configService.getAllConfigs().subscribe({
      next: (list) => {
        this.configs.set(list.map(c => ({ ...c, editing: false, editValue: c.value, saving: false })));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  startEdit(config: EditableConfig): void {
    this.configs.update(list => list.map(c =>
      c.key === config.key ? { ...c, editing: true, editValue: c.value } : c
    ));
  }

  cancelEdit(config: EditableConfig): void {
    this.configs.update(list => list.map(c =>
      c.key === config.key ? { ...c, editing: false, editValue: c.value } : c
    ));
  }

  saveConfig(config: EditableConfig): void {
    this.configs.update(list => list.map(c =>
      c.key === config.key ? { ...c, saving: true } : c
    ));

    this.configService.updateConfig(config.key, config.editValue).subscribe({
      next: (updated) => {
        this.configs.update(list => list.map(c =>
          c.key === updated.key ? { ...c, value: updated.value, editValue: updated.value, editing: false, saving: false } : c
        ));
        this.messageService.add({ severity: 'success', summary: 'Guardado', detail: `Configuración "${config.key}" actualizada.` });
      },
      error: () => {
        this.configs.update(list => list.map(c =>
          c.key === config.key ? { ...c, saving: false } : c
        ));
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la configuración.' });
      }
    });
  }

  updateEditValue(config: EditableConfig, value: string): void {
    this.configs.update(list => list.map(c =>
      c.key === config.key ? { ...c, editValue: value } : c
    ));
  }

  isBoolean(value: string): boolean {
    return value === 'true' || value === 'false';
  }
}
