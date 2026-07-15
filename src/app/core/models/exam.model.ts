export interface ExamConfig {
  id: string;
  code: string;
  year: number;
  level: 'PRIMARIA' | 'SECUNDARIA';
  specialtyName: string;
  formNumber: number;
  durationMinutes: number;
  totalQuestions: number;
  isActive: boolean;
}

export interface Question {
  id: string;
  number: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
}

export interface QuestionWithAnswer {
  id: string;
  number: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  correctAnswer: 'A' | 'B' | 'C';
  questionImages: string[];
  optionAImage: string | null;
  optionBImage: string | null;
  optionCImage: string | null;
}

export interface QuestionGroup {
  id: string;
  contextText: string;
  questionStart: number;
  questionEnd: number;
}

export interface ExamDetail {
  config: ExamConfig;
  questions: Question[];
  groups: QuestionGroup[];
}

export interface Specialty {
  id: string;
  name: string;
  description: string;
}
