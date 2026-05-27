import { NextResponse } from "next/server";
import { MODULES, QUESTIONS } from "@/lib/archetypes";
import type { FullSubmission } from "@/lib/types";

export const runtime = "nodejs";

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

  // Send to Zapier webhook (creates HubSpot contact + emails brief to team)
  const webhookUrl = process.env.ZAPIER_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          briefing,
          ...body,
        }),
      });
      if (!res.ok) {
        console.error("Zapier webhook failed:", res.status);
        return NextResponse.json(
          { ok: false, error: "Submission failed — please try again" },
          { status: 500 }
        );
      }
      console.log("✓ Sent to Zapier");
    } catch (err) {
      console.error("Zapier webhook error:", err);
      return NextResponse.json(
        { ok: false, error: "Submission failed — please try again" },
        { status: 500 }
      );
    }
  } else {
    console.log("⚠ ZAPIER_WEBHOOK_URL not set — logged locally only");
  }

  return NextResponse.json({ ok: true });
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
  lines.push("FIERCE WORKSHOP — ACCOUNT MANAGER BRIEFING");
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
  lines.push("RECOMMENDED MODULES (prospect did not see this)");
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
  lines.push("THEIR WORDS (use in the call)");
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
  lines.push("WORKSHOP LOGISTICS");
  lines.push(`  Format:  On-site (in-person — campaign default)`);
  lines.push(`  When:    ${sub.scope.preferredWindow}`);
  if (sub.scope.notes) lines.push(`  Notes:   ${sub.scope.notes}`);
  return lines.join("\n");
}
