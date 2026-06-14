export interface ExamConfigInfo {
  id: string;
  code: string;
  year: number;
  specialty: string;
  level: string;
  escala: string;
}

export interface ExamSession {
  id: string;
  escala: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED' | 'TIMED_OUT';
  startedAt: string;
  finishedAt?: string;
  durationMinutes: number;
}

export interface SessionStart {
  sessionId: string;
  examConfig: ExamConfigInfo;
  questions: QuestionForSession[];
  durationMinutes: number;
  startedAt: string;
}

export interface QuestionForSession {
  id: string;
  number: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  groupId?: string;
  answered?: boolean;
  selectedAnswer?: string;
}

export interface AnswerFeedback {
  questionId: string;
  answered: boolean;
}

export interface SessionResult {
  sessionId: string;
  status: string;
  totalQuestions: number;
  totalAnswered: number;
  totalCorrect: number;
  totalIncorrect: number;
  score: number;
  passingScore: number;
  passed: boolean;
  escala: string;
  durationSeconds: number;
  details: QuestionResultDetail[];
}

export interface QuestionResultDetail {
  questionId: string;
  number: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  selectedAnswer?: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface UserStats {
  totalExams: number;
  totalCompleted: number;
  totalPassed: number;
  averageScore: number;
  bestScore: number;
  examsByYear: Record<string, number>;
}

export interface SessionSummary {
  id: string;
  examCode: string;
  year: number;
  specialty: string;
  level: string;
  escala: string;
  status: string;
  score: number;
  passed: boolean;
  startedAt: string;
  finishedAt?: string;
}
