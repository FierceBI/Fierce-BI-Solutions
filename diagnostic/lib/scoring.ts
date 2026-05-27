import { MODULES } from "./archetypes";
import type {
  DiagnosticAnswers,
  ModuleId,
  ScoringResult,
} from "./types";

export function scoreDiagnostic(answers: DiagnosticAnswers): ScoringResult {
  const raw = answers.responses.where_stuck;
  const picks: string[] = Array.isArray(raw) ? raw : raw ? [raw] : [];

  const recommendedModules: ModuleId[] = picks
    .filter(isValidModule)
    .filter((id, idx, arr) => arr.indexOf(id) === idx);

  if (recommendedModules.length === 0) {
    recommendedModules.push(MODULES[0].id);
  }

  return {
    recommendedModules,
    painThemes: extractPainThemes(answers),
    urgencyTier: scoreUrgency(answers),
  };
}

function isValidModule(id: string | undefined): id is ModuleId {
  if (!id) return false;
  return MODULES.some((m) => m.id === id);
}

function asString(raw: string | string[] | undefined): string {
  if (!raw) return "";
  if (Array.isArray(raw)) return raw.join(" ");
  return raw;
}

function extractPainThemes(answers: DiagnosticAnswers): string[] {
  const themes: string[] = [];
  const unspoken = asString(answers.responses.unspoken);
  const changed = asString(answers.responses.what_changed);

  const haystack = `${unspoken} ${changed}`.toLowerCase();

  const triggers: Array<[string, RegExp]> = [
    ["Burnout / overwork",       /\bburn|burnt|exhaust|overwork|capacity\b/],
    ["Reorg / restructuring",    /\breorg|restructur|layoff|merger|acqui|integration\b/],
    ["New leader / transition",  /\bnew (ceo|leader|manager|vp|chro|director|head)|leadership change|onboard/],
    ["Engagement / culture",     /\bengag|culture|survey|glassdoor|toxic|morale\b/],
    ["Performance issue",        /\bperformance|underperform|pip|firing|terminate|let go\b/],
    ["Communication breakdown",  /\bcommunic|misalign|silo|disconnect\b/],
    ["Conflict / friction",      /\bconflict|friction|tension|argu|fight|clash\b/],
    ["Manager development",      /\bmanager|first[- ]time|new manager|coaching|develop\b/],
    ["Feedback culture",         /\bfeedback|review|1:1|one[- ]on[- ]one\b/],
    ["Decision-making",          /\bdecision|alignment|consensus\b/],
    ["Hybrid / remote",          /\bhybrid|remote|distributed|in[- ]person/],
    ["Generational",             /\bgenerat|gen z|millennial|boomer|young|senior\b/],
    ["Strategy rollout",         /\bstrategy|rollout|launch|new initiative|transformation\b/],
  ];

  for (const [label, re] of triggers) {
    if (re.test(haystack)) themes.push(label);
  }

  return themes;
}

function scoreUrgency(answers: DiagnosticAnswers): "high" | "medium" | "low" {
  const changed = asString(answers.responses.what_changed);
  const text = changed.toLowerCase();

  const highSignals =
    /\bnow|asap|this (quarter|month)|immediately|urgent|crisis|fire|exodus|losing\b/;
  const mediumSignals =
    /\bplanning|next (quarter|year)|q[1-4]|considering|exploring|evaluat/;

  if (highSignals.test(text)) return "high";
  if (mediumSignals.test(text)) return "medium";
  if (changed.length > 30) return "medium";
  return "low";
}
