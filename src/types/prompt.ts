export type PromptCategory =
  | "Writing"
  | "Coding"
  | "Learning"
  | "Brainstorming"
  | "Productivity"
  | "Research"
  | "Planning"
  | "Creative Work";

export interface PromptItem {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: PromptCategory;
}
