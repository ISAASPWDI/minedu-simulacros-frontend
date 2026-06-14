export interface ExamSession {
  id: string;
  examId: string;
  userId: string;
  escalaMagisterial: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  startedAt: string;
  finishedAt?: string;
  durationMinutes: number;
  timeRemainingSeconds: number;
}

export interface SessionStart {
  session: ExamSession;
  questions: QuestionForSession[];
  durationMinutes: number;
}

export interface QuestionForSession {
  id: string;
  number: number;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  groupContextText?: string;
  answered?: boolean;
  selectedAnswer?: string;
}

export interface AnswerFeedback {
  questionId: string;
  selectedAnswer: string;
  answered: boolean;
}

export interface SessionResult {
  sessionId: string;
  examCode: string;
  examYear: number;
  escalaMagisterial: string;
  totalQuestions: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  score: number;
  minScore: number;
  passed: boolean;
  durationSeconds: number;
  questions: QuestionResult[];
}

export interface QuestionResult {
  number: number;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  selectedAnswer?: string;
  correctAnswer: string;
  correct: boolean;
  groupContextText?: string;
}

export interface UserStats {
  totalSessions: number;
  passedSessions: number;
  failedSessions: number;
  averageScore: number;
  bestScore: number;
  lastSessionDate?: string;
  scoreHistory: number[];
}

export interface SessionSummary {
  sessionId: string;
  examCode: string;
  examYear: number;
  specialty: string;
  escalaMagisterial: string;
  score: number;
  passed: boolean;
  status: string;
  startedAt: string;
  durationSeconds: number;
}
