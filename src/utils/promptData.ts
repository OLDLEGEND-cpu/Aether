import type { PromptItem } from "../types/prompt";

export const PROMPT_LIBRARY: PromptItem[] = [
  {
    id: "p1",
    title: "Explain a complex topic simply",
    description: "Break down a difficult concept into plain language.",
    prompt: "Explain quantum computing to me like I'm new to the topic, using a simple analogy.",
    category: "Learning",
  },
  {
    id: "p2",
    title: "Debug JavaScript code",
    description: "Get help finding and fixing a bug in your code.",
    prompt: "Here is my JavaScript function. It's not working as expected — can you help me debug it?\n\n```js\n// paste your code here\n```",
    category: "Coding",
  },
  {
    id: "p3",
    title: "Write a professional email",
    description: "Draft a clear, polished email for work.",
    prompt: "Help me write a professional email to a client explaining a project delay, while keeping the tone reassuring.",
    category: "Writing",
  },
  {
    id: "p4",
    title: "Plan a project timeline",
    description: "Break a project into phases with a realistic schedule.",
    prompt: "Help me plan a project timeline for launching a small e-commerce website in 6 weeks.",
    category: "Planning",
  },
  {
    id: "p5",
    title: "Brainstorm startup ideas",
    description: "Generate fresh business ideas around a theme.",
    prompt: "Give me 10 startup ideas at the intersection of sustainability and consumer apps.",
    category: "Brainstorming",
  },
  {
    id: "p6",
    title: "Summarize research findings",
    description: "Condense a topic into key takeaways.",
    prompt: "Summarize the current scientific consensus on the health effects of intermittent fasting.",
    category: "Research",
  },
  {
    id: "p7",
    title: "Write a short story",
    description: "Get a creative narrative started.",
    prompt: "Write a short story about a lighthouse keeper who discovers a message in a bottle from the future.",
    category: "Creative Work",
  },
  {
    id: "p8",
    title: "Build a daily productivity system",
    description: "Design a personal workflow to stay organized.",
    prompt: "Help me design a simple daily productivity system using time-blocking and a prioritized task list.",
    category: "Productivity",
  },
  {
    id: "p9",
    title: "Code review checklist",
    description: "Get a structured checklist for reviewing pull requests.",
    prompt: "Create a thorough code review checklist for a React and TypeScript codebase.",
    category: "Coding",
  },
  {
    id: "p10",
    title: "Improve my resume bullet points",
    description: "Rewrite resume lines to be more impactful.",
    prompt: "Rewrite these resume bullet points to be more results-oriented and quantify impact where possible:\n\n- Worked on the marketing team\n- Helped with social media",
    category: "Writing",
  },
  {
    id: "p11",
    title: "Learn a new language efficiently",
    description: "Get a personalized study plan.",
    prompt: "Design a 3-month study plan for learning conversational Spanish as a complete beginner, studying 30 minutes a day.",
    category: "Learning",
  },
  {
    id: "p12",
    title: "Compare two technologies",
    description: "Get an unbiased technical comparison.",
    prompt: "Compare PostgreSQL and MongoDB for a mid-sized SaaS application. Include a pros/cons table.",
    category: "Research",
  },
];

export const CATEGORIES: PromptItem["category"][] = [
  "Writing",
  "Coding",
  "Learning",
  "Brainstorming",
  "Productivity",
  "Research",
  "Planning",
  "Creative Work",
];
