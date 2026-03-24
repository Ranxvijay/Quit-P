export interface Benefit {
  day: number;
  title: string;
  description: string;
  icon: string;
  category: 'mental' | 'physical' | 'social' | 'spiritual';
}

export const BENEFITS: Benefit[] = [
  {
    day: 1,
    title: "Dopamine Reset Begins",
    description: "Your brain's dopamine receptors start recovering. You may feel restless — that's normal. Acknowledge it and move forward.",
    icon: "⚡",
    category: "mental",
  },
  {
    day: 3,
    title: "More Mental Clarity",
    description: "Brain fog lifts slightly. You'll notice it's easier to concentrate on tasks that previously felt boring.",
    icon: "🧠",
    category: "mental",
  },
  {
    day: 7,
    title: "Testosterone Boost",
    description: "Studies show a 45% spike in testosterone around day 7. You may feel more energetic, assertive, and motivated.",
    icon: "💪",
    category: "physical",
  },
  {
    day: 10,
    title: "Better Eye Contact",
    description: "Many report feeling more confident making eye contact and engaging in real conversations.",
    icon: "👁️",
    category: "social",
  },
  {
    day: 14,
    title: "Improved Mood Stability",
    description: "The emotional rollercoaster starts to smooth out. You feel more grounded and less reactive.",
    icon: "😌",
    category: "mental",
  },
  {
    day: 21,
    title: "Habit Neural Pathways Weaken",
    description: "21 days is the scientifically recognized threshold for habit weakening. The old neural pathways are losing their grip.",
    icon: "🔗",
    category: "mental",
  },
  {
    day: 30,
    title: "Social Magnetism",
    description: "People genuinely notice a difference in your presence. You carry yourself differently — with more confidence and less anxiety.",
    icon: "🌟",
    category: "social",
  },
  {
    day: 45,
    title: "Deep Work Unlocked",
    description: "Your ability to focus for extended periods deepens significantly. Creative and productive output increases.",
    icon: "🎯",
    category: "mental",
  },
  {
    day: 60,
    title: "Emotional Depth Returns",
    description: "You can feel real emotions more vividly. Music, art, nature, and relationships all become more meaningful.",
    icon: "❤️",
    category: "spiritual",
  },
  {
    day: 90,
    title: "Complete Rewire",
    description: "At 90 days, brain scans show significant restoration of dopamine receptor sensitivity. You are a different person.",
    icon: "🏆",
    category: "mental",
  },
  {
    day: 180,
    title: "New Identity Solidified",
    description: "This is no longer a streak — it's who you are. Your self-concept has fundamentally shifted.",
    icon: "🦅",
    category: "spiritual",
  },
  {
    day: 365,
    title: "One Full Year of Freedom",
    description: "A complete year. You've proven to yourself that you are in control. This day changes everything.",
    icon: "🌅",
    category: "spiritual",
  },
];

export function getNextBenefit(currentDays: number): Benefit | null {
  return BENEFITS.find((b) => b.day > currentDays) ?? null;
}

export function getUnlockedBenefits(currentDays: number): Benefit[] {
  return BENEFITS.filter((b) => b.day <= currentDays);
}
