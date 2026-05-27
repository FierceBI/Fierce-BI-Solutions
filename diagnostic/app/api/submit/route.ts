import { NextResponse } from "next/server";
import { MODULES, QUESTIONS } from "@/lib/archetypes";
import type { FullSubmission } from "@/lib/types";

export const runtime = "nodejs";

const HUBSPOT_PORTAL_ID = "21395487";
const HUBSPOT_FORM_GUID = "563ba43b-4dcb-49dc-9eac-6ef46771d9be";

export async function POST(req: Request) {
  let body: FullSubmission;
  try {
    body = (await req.json()) as FullSubmission;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  if (
    !body?.context?.email ||
    !body?.result?.recommendedModules ||
    body.result.recommendedModules.length === 0
  ) {
    return NextResponse.json(
      { ok: false, error: "Missing required fields" },
      { status: 400 }
    );
  }

  const briefing = formatBriefing(body);

  console.log("\n========== FIERCE DIAGNOSTIC SUBMISSION ==========\n");
  console.log(briefing);
  console.log("\n==================================================\n");

  // Submit to HubSpot form
  const hubspotResult = await submitToHubSpot(body, briefing);
  if (!hubspotResult.ok) {
    console.error("HubSpot submission failed:", hubspotResult.error);
    return NextResponse.json(
      { ok: false, error: "Submission failed — please try again" },
      { status: 500 }
    );
  }
  console.log("✓ Submitted to HubSpot");

  return NextResponse.json({ ok: true });
}

async function submitToHubSpot(
  sub: FullSubmission,
  briefing: string
): Promise<{ ok: boolean; error?: string }> {
  const [firstname, ...lastParts] = sub.context.name.trim().split(/\s+/);
  const lastname = lastParts.join(" ");

  const primaryModule = MODULES.find(
    (m) => m.id === sub.result.recommendedModules[0]
  );

  const fields = [
    { objectTypeId: "0-1", name: "email", value: sub.context.email },
    { objectTypeId: "0-1", name: "firstname", value: firstname || "" },
    { objectTypeId: "0-1", name: "lastname", value: lastname || "" },
    { objectTypeId: "0-1", name: "company", value: sub.context.company },
    { objectTypeId: "0-1", name: "jobtitle", value: sub.context.role },
    // Custom properties - create these in HubSpot if they don't exist
    { objectTypeId: "0-1", name: "team_size", value: sub.context.teamSize },
    { objectTypeId: "0-1", name: "recommended_module", value: primaryModule?.name ?? "" },
    { objectTypeId: "0-1", name: "urgency", value: sub.result.urgencyTier },
    { objectTypeId: "0-1", name: "diagnostic_brief", value: briefing },
  ];

  // Add UTM params if present (HubSpot standard tracking fields)
  const utm = sub.utmParams;
  if (utm?.utm_source) fields.push({ objectTypeId: "0-1", name: "hs_analytics_source", value: utm.utm_source });
  if (utm?.utm_medium) fields.push({ objectTypeId: "0-1", name: "utm_medium", value: utm.utm_medium });
  if (utm?.utm_campaign) fields.push({ objectTypeId: "0-1", name: "utm_campaign", value: utm.utm_campaign });
  if (utm?.utm_content) fields.push({ objectTypeId: "0-1", name: "utm_content", value: utm.utm_content });
  if (utm?.gclid) fields.push({ objectTypeId: "0-1", name: "gclid", value: utm.gclid });

  const url = `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_GUID}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields,
        context: {
          pageName: "Fierce Workshop Diagnostic",
        },
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return { ok: false, error: `HubSpot ${res.status}: ${errorText.slice(0, 300)}` };
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

function formatBriefing(sub: FullSubmission): string {
  const picked = sub.result.recommendedModules ?? [];
  const primaryModule = MODULES.find((m) => m.id === picked[0]);
  const additionalModules = picked
    .slice(1)
    .map((id) => MODULES.find((m) => m.id === id))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  const unspokenQ = QUESTIONS.find((q) => q.id === "unspoken");
  const changedQ = QUESTIONS.find((q) => q.id === "what_changed");
  const stuckQ = QUESTIONS.find((q) => q.id === "where_stuck");
  const unspoken =
    typeof sub.answers.unspoken === "string" ? sub.answers.unspoken : "";
  const changed =
    typeof sub.answers.what_changed === "string" ? sub.answers.what_changed : "";

  const rawStuck = sub.answers.where_stuck;
  const stuckIds: string[] = Array.isArray(rawStuck)
    ? rawStuck
    : rawStuck
    ? [rawStuck]
    : [];
  const stuckLabels = stuckIds.map(
    (id, i) =>
      `  ${i + 1}. ${
        stuckQ?.choices?.find((c) => c.id === id)?.label ?? id
      }`
  );

  const lines: string[] = [];
  lines.push("FIERCE WORKSHOP DIAGNOSTIC — SALES BRIEF");
  lines.push("");
  lines.push(`Submitted: ${new Date(sub.submittedAt).toLocaleString()}`);
  lines.push("");
  lines.push("CONTACT");
  lines.push(`  Name:    ${sub.context.name}`);
  lines.push(`  Email:   ${sub.context.email}`);
  lines.push(`  Company: ${sub.context.company}`);
  lines.push(`  Role:    ${sub.context.role}`);
  lines.push(`  Team:    ${sub.context.teamSize}`);
  lines.push("");
  lines.push("RECOMMENDED MODULES");
  lines.push(`  Primary:      ${primaryModule?.name ?? "—"}`);
  if (additionalModules.length > 0) {
    lines.push(
      `  Also flagged: ${additionalModules.map((m) => m.name).join(", ")}`
    );
  }
  if (primaryModule) {
    lines.push(`  Pattern:      ${primaryModule.patternName}`);
    lines.push(`  How it works: ${primaryModule.howItWorks}`);
    lines.push(`  Impact:       ${primaryModule.businessImpact}`);
  }
  lines.push(`  Urgency:      ${sub.result.urgencyTier.toUpperCase()}`);
  if (sub.result.painThemes.length) {
    lines.push(`  Themes:       ${sub.result.painThemes.join(", ")}`);
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
  lines.push(`  When:    ${sub.scope.preferredWindow}`);
  if (sub.scope.notes) lines.push(`  Notes:   ${sub.scope.notes}`);
  return lines.join("\n");
}
