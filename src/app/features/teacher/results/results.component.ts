import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { Accordion, AccordionPanel, AccordionHeader, AccordionContent } from 'primeng/accordion';
import { TagModule } from 'primeng/tag';
import { SimulationService } from '../../../core/services/simulation.service';
import { SessionResult, QuestionResultDetail } from '../../../core/models/simulation.model';
import { EscalaPipe } from '../../../shared/pipes/escala.pipe';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, ButtonModule, ProgressBarModule, Accordion, AccordionPanel, AccordionHeader, AccordionContent, TagModule, EscalaPipe],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss'
})
export class ResultsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private simulationService = inject(SimulationService);

  result = signal<SessionResult | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    const sessionId = this.route.snapshot.paramMap.get('sessionId') ?? '';
    this.simulationService.getResult(sessionId).subscribe({
      next: (r) => { this.result.set(r); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  getAnswerLabel(q: QuestionResultDetail, answer?: string): string {
    if (!answer) return 'Sin responder';
    const map: Record<string, string> = { A: q.optionA, B: q.optionB, C: q.optionC };
    return `${answer}) ${map[answer] ?? ''}`;
  }

  getAnswerClass(q: QuestionResultDetail): string {
    if (!q.selectedAnswer) return 'unanswered';
    return q.isCorrect ? 'correct' : 'incorrect';
  }

  get scorePercent(): number {
    const r = this.result();
    if (!r) return 0;
    return Math.round((r.score / r.totalQuestions) * 100);
  }

  retry(): void {
    this.router.navigate(['/teacher/exams']);
  }

  goHistory(): void {
    this.router.navigate(['/teacher/history']);
  }

  goDashboard(): void {
    this.router.navigate(['/teacher/dashboard']);
  }
}
