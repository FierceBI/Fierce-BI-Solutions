import type { Module, Question } from "./types";

export const MODULES: Module[] = [
  {
    id: "confront",
    name: "FIERCE CONFRONT®",
    patternName: "Hard Conversations Aren't Happening",
    currentState: "Issues stay unresolved or get softened.",
    howItWorks:
      "Teaches a structured approach to prepare and open difficult conversations with clarity and collaboration.",
    withoutFierce: "Problems linger and become cultural norms.",
    withFierce: "Leaders address truth early and productively.",
    businessImpact: "Faster issue resolution, less tension, stronger trust.",
  },
  {
    id: "accountability",
    name: "FIERCE ACCOUNTABILITY®",
    patternName: "Commitments Aren't Sticking",
    currentState: "Blame, missed follow-through, unclear ownership.",
    howItWorks:
      "Shifts leaders from victim mindset to ownership, clarity, commitment, and follow-through.",
    withoutFierce: "Deadlines slip and ownership stays vague.",
    withFierce: "Teams make clear commitments and act on them.",
    businessImpact: "Improved execution and project reliability.",
  },
  {
    id: "team",
    name: "FIERCE TEAM®",
    patternName: "Decisions Don't Stick",
    currentState: "Voices are missing; meetings don't surface real issues.",
    howItWorks:
      "Builds collaboration, alignment, inclusive decision-making, and stronger team discussion practices.",
    withoutFierce: "Silos and hidden misalignment continue.",
    withFierce: "Teams include the right perspectives and decide faster.",
    businessImpact: "Better decisions, stronger alignment, less rework.",
  },
  {
    id: "coach",
    name: "FIERCE COACH®",
    patternName: "Managers Fix Instead of Develop",
    currentState: "1:1s are transactional; employees depend on managers.",
    howItWorks:
      "Uses a question-based model to help others uncover insight, motivation, and action.",
    withoutFierce: "Managers stay overextended.",
    withFierce: "Employees think, decide, and act with more ownership.",
    businessImpact:
      "More ownership, stronger development, less manager bottlenecking.",
  },
  {
    id: "delegate",
    name: "FIERCE DELEGATE®",
    patternName: "Ownership Is Unclear",
    currentState: "Employees are unsure of authority or decision rights.",
    howItWorks:
      "Uses the Decision Tree model to clarify responsibility and decision-making based on skill and readiness.",
    withoutFierce: "Leaders stay overloaded.",
    withFierce: "Work moves to the right level with clarity.",
    businessImpact: "Increased capacity, faster execution, leadership growth.",
  },
  {
    id: "feedback",
    name: "FIERCE FEEDBACK®",
    patternName: "Feedback Is an Event, Not a Habit",
    currentState: "Performance conversations happen too late.",
    howItWorks:
      "Teaches a simple process for giving, asking for, and receiving feedback — and offering praise.",
    withoutFierce: "Feedback becomes event-based or avoided.",
    withFierce: "Feedback becomes a normal leadership habit.",
    businessImpact: "Continuous improvement, higher trust, stronger performance.",
  },
];

export const QUESTIONS: Question[] = [
  {
    id: "context",
    prompt: "Before we dig in — who are you and who's your team?",
    helper:
      "Takes 20 seconds. We use this to tailor your recommendation and pass context to your facilitator.",
    type: "context",
  },
  {
    id: "unspoken",
    prompt: "What's the conversation your team is NOT having right now?",
    helper:
      "Be specific. The clearer the answer, the sharper the recommendation. Whatever you write here stays between us and your facilitator.",
    type: "text",
  },
  {
    id: "where_stuck",
    prompt: "Where does your team get stuck?",
    helper: "Pick up to 3 — start with the biggest. The more honest, the sharper the conversation when we follow up.",
    type: "chips_multi",
    maxSelections: 3,
    choices: [
      { id: "confront",       label: "We avoid the hard conversations until they boil over." },
      { id: "accountability", label: "People make commitments — follow-through is inconsistent." },
      { id: "team",           label: "Our meetings don't surface the real issues. Alignment is theater." },
      { id: "coach",          label: "Our managers fix problems instead of coaching people through them." },
      { id: "delegate",       label: "Delegation is unclear — people don't know what they own or what they can decide." },
      { id: "feedback",       label: "Feedback happens too late, or only at review time." },
    ],
  },
  {
    id: "what_changed",
    prompt:
      "What changed in the last 6 months that has you exploring training now?",
    helper:
      "A new leader? A reorg? A culture survey result? A specific conversation that didn't go well? The more honest, the better.",
    type: "text",
  },
];
