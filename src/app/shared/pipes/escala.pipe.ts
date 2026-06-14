import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'escala', standalone: true })
export class EscalaPipe implements PipeTransform {
  private map: Record<string, string> = {
    PRIMERA: '1ra Escala',
    SEGUNDA: '2da Escala',
    TERCERA: '3ra Escala',
    CUARTA: '4ta Escala',
    QUINTA: '5ta Escala',
    SEXTA: '6ta Escala',
    SEPTIMA: '7ma Escala',
    OCTAVA: '8va Escala'
  };

  transform(value: string): string {
    return this.map[value?.toUpperCase()] ?? value;
  }
}
