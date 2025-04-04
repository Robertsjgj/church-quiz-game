export interface Team {
  id: number;
  name: string;
  score: number;
  color: string;
}

export interface Question {
  number: number;
  isAnswered: boolean;
  category: 'easy' | 'medium' | 'hard';
  points: number;
  question: string;
  answer: string;
}

export interface GameState {
  currentTeam: number;
  selectedQuestion: number | null;
  teams: Team[];
  questions: Question[];
  timer: number | null;
  passingPhase: boolean;
  availablePassTeams: number[];
  isConfiguring: boolean;
  isManualMode: boolean;
}

export interface WinnerRevealState {
  showPodium: boolean;
  showThird: boolean;
  showSecond: boolean;
  showFirst: boolean;
  showConfetti: boolean;
}