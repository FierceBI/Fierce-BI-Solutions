import { MODULES, QUESTIONS } from "./archetypes";
import type {
  ContextAnswers,
  DiagnosticAnswers,
  ScopeAnswers,
  ScoringResult,
  UtmParams,
} from "./types";

const HUBSPOT_PORTAL_ID = "21395487";
const HUBSPOT_FORM_GUID = "563ba43b-4dcb-49dc-9eac-6ef46771d9be";

export async function submitToHubSpot(
  context: ContextAnswers,
  answers: DiagnosticAnswers["responses"],
  result: ScoringResult,
  scope: ScopeAnswers,
  utmParams: UtmParams
): Promise<boolean> {
  const briefing = formatBriefing(context, answers, result, scope);

  // Log briefing to console for debugging
  console.log("\n========== FIERCE DIAGNOSTIC SUBMISSION ==========\n");
  console.log(briefing);
  console.log("\n==================================================\n");

  const [firstname, ...lastParts] = context.name.trim().split(/\s+/);
  const lastname = lastParts.join(" ");

  const primaryModule = MODULES.find((m) => m.id === result.recommendedModules[0]);

  const fields = [
    { objectTypeId: "0-1", name: "email", value: context.email },
    { objectTypeId: "0-1", name: "firstname", value: firstname || "" },
    { objectTypeId: "0-1", name: "lastname", value: lastname || "" },
    { objectTypeId: "0-1", name: "company", value: context.company },
    { objectTypeId: "0-1", name: "jobtitle", value: context.role },
    { objectTypeId: "0-1", name: "team_size", value: context.teamSize },
    { objectTypeId: "0-1", name: "recommended_module", value: primaryModule?.name ?? "" },
    { objectTypeId: "0-1", name: "urgency", value: result.urgencyTier },
    { objectTypeId: "0-1", name: "diagnostic_brief", value: briefing },
  ];

  // Add UTM params if present
  if (utmParams.utm_source) fields.push({ objectTypeId: "0-1", name: "hs_analytics_source", value: utmParams.utm_source });
  if (utmParams.utm_medium) fields.push({ objectTypeId: "0-1", name: "utm_medium", value: utmParams.utm_medium });
  if (utmParams.utm_campaign) fields.push({ objectTypeId: "0-1", name: "utm_campaign", value: utmParams.utm_campaign });
  if (utmParams.utm_content) fields.push({ objectTypeId: "0-1", name: "utm_content", value: utmParams.utm_content });
  if (utmParams.gclid) fields.push({ objectTypeId: "0-1", name: "gclid", value: utmParams.gclid });

  const url = `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_GUID}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields,
        context: {
          pageName: "Fierce Workshop Diagnostic",
          pageUri: window.location.href,
        },
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("HubSpot submission failed:", res.status, errorText);
      return false;
    }

    console.log("✓ Submitted to HubSpot");
    return true;
  } catch (err) {
    console.error("HubSpot submission error:", err);
    return false;
  }
}

function formatBriefing(
  context: ContextAnswers,
  answers: DiagnosticAnswers["responses"],
  result: ScoringResult,
  scope: ScopeAnswers
): string {
  const picked = result.recommendedModules ?? [];
  const primaryModule = MODULES.find((m) => m.id === picked[0]);
  const additionalModules = picked
    .slice(1)
    .map((id) => MODULES.find((m) => m.id === id))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  const unspokenQ = QUESTIONS.find((q) => q.id === "unspoken");
  const changedQ = QUESTIONS.find((q) => q.id === "what_changed");
  const stuckQ = QUESTIONS.find((q) => q.id === "where_stuck");
  const unspoken = typeof answers.unspoken === "string" ? answers.unspoken : "";
  const changed = typeof answers.what_changed === "string" ? answers.what_changed : "";

  const rawStuck = answers.where_stuck;
  const stuckIds: string[] = Array.isArray(rawStuck)
    ? rawStuck
    : rawStuck
    ? [rawStuck]
    : [];
  const stuckLabels = stuckIds.map(
    (id, i) =>
      `  ${i + 1}. ${stuckQ?.choices?.find((c) => c.id === id)?.label ?? id}`
  );

  const lines: string[] = [];
  lines.push("FIERCE WORKSHOP DIAGNOSTIC — SALES BRIEF");
  lines.push("");
  lines.push(`Submitted: ${new Date().toLocaleString()}`);
  lines.push("");
  lines.push("CONTACT");
  lines.push(`  Name:    ${context.name}`);
  lines.push(`  Email:   ${context.email}`);
  lines.push(`  Company: ${context.company}`);
  lines.push(`  Role:    ${context.role}`);
  lines.push(`  Team:    ${context.teamSize}`);
  lines.push("");
  lines.push("RECOMMENDED MODULES");
  lines.push(`  Primary:      ${primaryModule?.name ?? "—"}`);
  if (additionalModules.length > 0) {
    lines.push(`  Also flagged: ${additionalModules.map((m) => m.name).join(", ")}`);
  }
  if (primaryModule) {
    lines.push(`  Pattern:      ${primaryModule.patternName}`);
    lines.push(`  How it works: ${primaryModule.howItWorks}`);
    lines.push(`  Impact:       ${primaryModule.businessImpact}`);
  }
  lines.push(`  Urgency:      ${result.urgencyTier.toUpperCase()}`);
  if (result.painThemes.length) {
    lines.push(`  Themes:       ${result.painThemes.join(", ")}`);
  }
  lines.push("");
  lines.push("THEIR WORDS");
  if (unspoken) {
    lines.push(`  Q: ${unspokenQ?.prompt}`);
    lines.push(`  A: "${unspoken}"`);
    lines.push("");
  }
  if (stuckLabels.length > 0) {
    lines.push(`  Q: ${stuckQ?.prompt}`);
    lines.push(`  A: (in priority order)`);
    for (const label of stuckLabels) {
      lines.push(label);
    }
    lines.push("");
  }
  if (changed) {
    lines.push(`  Q: ${changedQ?.prompt}`);
    lines.push(`  A: "${changed}"`);
    lines.push("");
  }
  lines.push("LOGISTICS");
  lines.push(`  Format:  On-site (in-person)`);
  lines.push(`  When:    ${scope.preferredWindow}`);
  if (scope.notes) lines.push(`  Notes:   ${scope.notes}`);
  return lines.join("\n");
}
