export interface AnalysisResult {
  situation: string;
  causes: string[];
  plan: string[];
  message?: string;
}

export interface ResourceArticle {
  id: string;
  title: string;
  description: string;
  readTime: string;
  source: string;
  url: string;
}

export type SituationCategory =
  | "work stress"
  | "relationship conflict"
  | "career change"
  | "financial stress"
  | "productivity issues";
