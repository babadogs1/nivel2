export interface SubTopic {
  name: string;
}

export interface Topic {
  name: string;
  subTopics: SubTopic[];
}

export interface Subject {
  name: string;
  topics: Topic[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Quiz {
  questions: QuizQuestion[];
}

export type StudyMode = 'study' | 'exam' | 'flashcards';

export interface StudyContext {
  university: string;
  topic: string;
  subTopic: SubTopic;
}

export interface QuizResult {
  university: string;
  topic: string;
  subTopic: string | "Simulador General";
  score: number;
  totalQuestions: number;
  date: string;
}


export interface TableData {
  headers: string[];
  rows: (string | number)[][];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie';
  labels: string[];
  datasets: ChartDataset[];
  title: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface Flashcard {
  term: string;
  definition: string;
}

export interface StudyPlanDay {
    day: number;
    week: number;
    subTopic: string;
    topic: string;
    status: 'pending' | 'completed';
}

export interface StudyPlan {
    university: string;
    weeks: number;
    hoursPerWeek: number;
    plan: StudyPlanDay[];
}