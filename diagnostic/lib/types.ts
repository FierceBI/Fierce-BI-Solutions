export type ModuleId =
  | "confront"
  | "accountability"
  | "team"
  | "coach"
  | "delegate"
  | "feedback";

export interface Module {
  id: ModuleId;
  name: string;
  patternName: string;
  currentState: string;
  howItWorks: string;
  withoutFierce: string;
  withFierce: string;
  businessImpact: string;
}

export interface ChipChoice {
  id: ModuleId;
  label: string;
}

export interface Question {
  id: string;
  prompt: string;
  helper?: string;
  type: "chips_single" | "chips_multi" | "text" | "context";
  choices?: ChipChoice[];
  maxSelections?: number;
}

export interface ContextAnswers {
  name: string;
  email: string;
  company: string;
  role: string;
  teamSize: string;
}

export interface DiagnosticAnswers {
  context: ContextAnswers;
  responses: Record<string, string | string[]>;
}

export interface ScoringResult {
  recommendedModules: ModuleId[];
  painThemes: string[];
  urgencyTier: "high" | "medium" | "low";
}

export interface ScopeAnswers {
  preferredWindow: string;
  notes: string;
}

export interface FullSubmission {
  context: ContextAnswers;
  answers: DiagnosticAnswers["responses"];
  result: ScoringResult;
  scope: ScopeAnswers;
  submittedAt: string;
}
