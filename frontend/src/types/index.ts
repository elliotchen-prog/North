export interface AnalysisResult {
  situation: string;
  causes: string[];
  plan: string[];
  message?: string;
}

export type SituationCategory =
  | "work stress"
  | "relationship conflict"
  | "career change"
  | "financial stress"
  | "productivity issues";
