import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'nivel', standalone: true })
export class NivelPipe implements PipeTransform {
  private map: Record<string, string> = {
    PRIMARIA: 'EBR Primaria',
    SECUNDARIA: 'EBR Secundaria',
    INICIAL: 'EBR Inicial'
  };

  transform(value: string): string {
    return this.map[value?.toUpperCase()] ?? value;
  }
}
