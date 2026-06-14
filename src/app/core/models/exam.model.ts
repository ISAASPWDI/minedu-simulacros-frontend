export interface ExamConfig {
  id: string;
  code: string;
  year: number;
  level: 'PRIMARIA' | 'SECUNDARIA';
  specialty: string;
  forma: number;
  durationMinutes: number;
  totalQuestions: number;
  active: boolean;
  createdAt: string;
}

export interface Question {
  id: string;
  number: number;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  correctAnswer?: string;
  groupId?: string;
}

export interface QuestionGroup {
  id: string;
  contextText: string;
  questions: Question[];
}

export interface ExamDetail {
  exam: ExamConfig;
  questions: Question[];
  groups: QuestionGroup[];
}

export interface Specialty {
  id: string;
  name: string;
  level: string;
}
