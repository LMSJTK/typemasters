export type ViewState =
  | "dashboard"
  | "lessons"
  | "practice"
  | "games"
  | "designer"
  | "reports";

export interface TypingStats {
  id: string;
  date: number;
  wpm: number;
  accuracy: number;
  type: "lesson" | "practice" | "game";
  details?: string;
}

export interface Lesson {
  id: string;
  title: string;
  text: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}
