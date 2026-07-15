import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ExamService } from '../../../../core/services/exam.service';
import { ExamConfig, QuestionWithAnswer } from '../../../../core/models/exam.model';

@Component({
  selector: 'app-exam-editor',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, ToastModule, DialogModule,
    ConfirmDialogModule, InputTextModule, TextareaModule, SelectModule,
    TagModule, TooltipModule, ProgressSpinnerModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './exam-editor.component.html',
  styleUrl: './exam-editor.component.scss'
})
export class ExamEditorComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private examService = inject(ExamService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  examId = signal('');
  exam = signal<ExamConfig | null>(null);
  questions = signal<QuestionWithAnswer[]>([]);
  currentIndex = signal(0);
  loading = signal(true);
  saving = signal(false);
  uploadingImage = signal(false);
  deletingQuestion = signal(false);

  showAddDialog = signal(false);
  addingQuestion = signal(false);

  // Which image slot the hidden file input currently targets.
  uploadTarget = signal<'question' | 'A' | 'B' | 'C'>('question');

  newQuestion = signal<Partial<QuestionWithAnswer>>({
    number: 1,
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    correctAnswer: 'A',
    questionImages: [],
    optionAImage: null,
    optionBImage: null,
    optionCImage: null
  });

  answerOptions = [
    { label: 'A', value: 'A' },
    { label: 'B', value: 'B' },
    { label: 'C', value: 'C' }
  ];

  currentQuestion = computed(() => this.questions()[this.currentIndex()] ?? null);

  // Local editable copy of the current question
  editData = signal<QuestionWithAnswer | null>(null);
  isDirty = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.examId.set(id);
    this.loadData(id);
  }

  loadData(id: string): void {
    this.loading.set(true);
    this.examService.getExamDetail(id).subscribe({
      next: (detail) => {
        this.exam.set(detail.config);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
    this.examService.getQuestionsWithAnswers(id).subscribe({
      next: (qs) => {
        this.questions.set(qs);
        this.initEditData(qs[0] ?? null);
      }
    });
  }

  initEditData(q: QuestionWithAnswer | null): void {
    this.editData.set(q ? { ...q } : null);
    this.isDirty.set(false);
  }

  goToQuestion(index: number): void {
    if (this.isDirty()) {
      this.confirmationService.confirm({
        message: 'Hay cambios sin guardar. ¿Descartar y continuar?',
        header: 'Cambios pendientes',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Descartar',
        rejectLabel: 'Cancelar',
        accept: () => {
          this.currentIndex.set(index);
          this.initEditData(this.questions()[index]);
        }
      });
    } else {
      this.currentIndex.set(index);
      this.initEditData(this.questions()[index]);
    }
  }

  prevQuestion(): void {
    if (this.currentIndex() > 0) this.goToQuestion(this.currentIndex() - 1);
  }

  nextQuestion(): void {
    if (this.currentIndex() < this.questions().length - 1) this.goToQuestion(this.currentIndex() + 1);
  }

  onFieldChange(): void {
    this.isDirty.set(true);
  }

  saveQuestion(): void {
    const q = this.editData();
    if (!q) return;
    this.saving.set(true);
    this.examService.updateQuestion(this.examId(), q.id, {
      number: q.number,
      questionText: q.questionText,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      correctAnswer: q.correctAnswer,
      questionImages: q.questionImages ?? [],
      optionAImage: q.optionAImage,
      optionBImage: q.optionBImage,
      optionCImage: q.optionCImage
    }).subscribe({
      next: (updated) => {
        this.saving.set(false);
        this.isDirty.set(false);
        this.questions.update(qs => qs.map(item => item.id === updated.id ? updated : item));
        this.editData.set({ ...updated });
        this.messageService.add({ severity: 'success', summary: 'Guardado', detail: `Pregunta ${updated.number} actualizada.` });
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo guardar.' });
      }
    });
  }

  triggerImageUpload(target: 'question' | 'A' | 'B' | 'C'): void {
    this.uploadTarget.set(target);
    const input = document.getElementById('imageFileInput') as HTMLInputElement;
    if (input) {
      // Only the question statement accepts multiple images at once.
      input.multiple = target === 'question';
      input.value = '';
      input.click();
    }
  }

  onImageFileSelected(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    if (!files.length) return;
    const target = this.uploadTarget();
    this.uploadingImage.set(true);

    Promise.all(files.map(f => new Promise<string>((resolve, reject) => {
      this.examService.uploadImage(f).subscribe({ next: resolve, error: reject });
    }))).then(urls => {
      this.uploadingImage.set(false);
      this.editData.update(q => {
        if (!q) return q;
        if (target === 'question') {
          return { ...q, questionImages: [...(q.questionImages ?? []), ...urls] };
        }
        const key = target === 'A' ? 'optionAImage' : target === 'B' ? 'optionBImage' : 'optionCImage';
        return { ...q, [key]: urls[0] };
      });
      this.isDirty.set(true);
      this.messageService.add({ severity: 'success', summary: 'Imagen subida', detail: 'Imagen actualizada.' });
    }).catch(() => {
      this.uploadingImage.set(false);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo subir la imagen.' });
    });
  }

  removeQuestionImage(index: number): void {
    this.editData.update(q => {
      if (!q) return q;
      const imgs = [...(q.questionImages ?? [])];
      imgs.splice(index, 1);
      return { ...q, questionImages: imgs };
    });
    this.isDirty.set(true);
  }

  removeOptionImage(opt: 'A' | 'B' | 'C'): void {
    const key = opt === 'A' ? 'optionAImage' : opt === 'B' ? 'optionBImage' : 'optionCImage';
    this.editData.update(q => q ? { ...q, [key]: null } : q);
    this.isDirty.set(true);
  }

  confirmDeleteQuestion(): void {
    const q = this.currentQuestion();
    if (!q) return;
    this.confirmationService.confirm({
      message: `¿Eliminar la pregunta ${q.number}? Esta acción no se puede deshacer.`,
      header: 'Eliminar Pregunta',
      icon: 'pi pi-trash',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteQuestion(q)
    });
  }

  deleteQuestion(q: QuestionWithAnswer): void {
    this.deletingQuestion.set(true);
    this.examService.deleteQuestion(this.examId(), q.id).subscribe({
      next: () => {
        this.deletingQuestion.set(false);
        const newList = this.questions().filter(item => item.id !== q.id);
        this.questions.set(newList);
        const newIndex = Math.min(this.currentIndex(), newList.length - 1);
        this.currentIndex.set(Math.max(0, newIndex));
        this.initEditData(newList[Math.max(0, newIndex)] ?? null);
        this.messageService.add({ severity: 'success', summary: 'Eliminada', detail: `Pregunta ${q.number} eliminada.` });
      },
      error: () => {
        this.deletingQuestion.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar.' });
      }
    });
  }

  openAddDialog(): void {
    const nextNumber = this.questions().length > 0
      ? Math.max(...this.questions().map(q => q.number)) + 1
      : 1;
    this.newQuestion.set({
      number: nextNumber,
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      correctAnswer: 'A',
      questionImages: [],
      optionAImage: null,
      optionBImage: null,
      optionCImage: null
    });
    this.showAddDialog.set(true);
  }

  addQuestion(): void {
    const nq = this.newQuestion();
    const hasStatement = !!nq.questionText || (nq.questionImages?.length ?? 0) > 0;
    const optionOk = (text?: string, img?: string | null) => !!(text && text.trim()) || !!img;
    if (!hasStatement
        || !optionOk(nq.optionA, nq.optionAImage)
        || !optionOk(nq.optionB, nq.optionBImage)
        || !optionOk(nq.optionC, nq.optionCImage)) {
      this.messageService.add({ severity: 'warn', summary: 'Campos requeridos', detail: 'Cada opción y el enunciado necesitan texto o imagen.' });
      return;
    }
    this.addingQuestion.set(true);
    this.examService.addQuestion(this.examId(), nq).subscribe({
      next: (added) => {
        this.addingQuestion.set(false);
        this.showAddDialog.set(false);
        const newList = [...this.questions(), added].sort((a, b) => a.number - b.number);
        this.questions.set(newList);
        const idx = newList.findIndex(q => q.id === added.id);
        this.currentIndex.set(idx);
        this.initEditData(added);
        this.messageService.add({ severity: 'success', summary: 'Agregada', detail: `Pregunta ${added.number} creada.` });
      },
      error: (err) => {
        this.addingQuestion.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo agregar.' });
      }
    });
  }

  setNewCorrectAnswer(opt: string): void {
    this.newQuestion.update(q => ({ ...q!, correctAnswer: opt as 'A' | 'B' | 'C' }));
  }

  setNewOptionText(opt: string, value: string): void {
    if (opt === 'A') this.newQuestion.update(q => ({ ...q!, optionA: value }));
    else if (opt === 'B') this.newQuestion.update(q => ({ ...q!, optionB: value }));
    else this.newQuestion.update(q => ({ ...q!, optionC: value }));
  }

  getNewOptionText(opt: string): string {
    const nq = this.newQuestion();
    if (opt === 'A') return nq.optionA ?? '';
    if (opt === 'B') return nq.optionB ?? '';
    return nq.optionC ?? '';
  }

  goBack(): void {
    this.router.navigate(['/admin/exams']);
  }
}
