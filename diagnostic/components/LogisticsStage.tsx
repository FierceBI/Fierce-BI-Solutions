"use client";

import { useState } from "react";
import type { ScopeAnswers } from "@/lib/types";

export function LogisticsStage({
  initialScope,
  onSubmit,
  onBack,
}: {
  initialScope?: ScopeAnswers;
  onSubmit: (scope: ScopeAnswers) => void;
  onBack: () => void;
}) {
  const [window, setWindow] = useState<string>(
    initialScope?.preferredWindow ?? ""
  );
  const [notes, setNotes] = useState<string>(initialScope?.notes ?? "");

  const valid = window.length > 0;

  return (
    <div className="stage-enter max-w-2xl mx-auto pt-8 pb-12">
      <p className="text-fierce-orange text-xs font-bold tracking-[0.25em] uppercase mb-3">
        One last thing
      </p>

      <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-[1.1] fierce-underline pb-3">
        A few details before we land this.
      </h2>

      <p className="text-fierce-cream/60 text-base md:text-lg mt-6 leading-relaxed">
        We&apos;ve got what we need to recommend the right module. These last
        details help us scope the session so Regent can come in ready to work — not stuck on logistics.
      </p>

      <div className="mt-10 space-y-8">
        {/* In-person reinforcement — replaces the old format-choice chips */}
        <div className="card-glow card-glow-strong rounded-2xl bg-gradient-to-br from-fierce-orange/[0.06] to-fierce-orange-deep/[0.03] p-5 md:p-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0 mt-0.5">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-fierce-gradient text-fierce-black font-black">
                ✓
              </span>
            </div>
            <div>
              <p className="font-bold text-fierce-cream text-base md:text-lg leading-tight">
                We come to you.
              </p>
              <p className="text-sm md:text-base text-fierce-cream/70 mt-1.5 leading-relaxed">
                Master Facilitator Regent Cornell runs the 40-minute session on-site, in
                your space. No travel for your team, no Zoom fatigue.
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold tracking-widest text-fierce-cream/50 uppercase mb-3">
            When are you hoping to run it?
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              "Next 2 weeks",
              "This month",
              "Next month",
              "This quarter",
              "Next quarter",
              "Flexible",
            ].map((w) => (
              <button
                key={w}
                onClick={() => setWindow(w)}
                className={`chip card-glow text-sm py-2.5 px-3 rounded-lg ${
                  window === w ? "selected" : ""
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold tracking-widest text-fierce-cream/50 uppercase mb-3">
            Anything else we should know?{" "}
            <span className="opacity-50 font-medium">(optional)</span>
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="fierce-input card-glow w-full px-5 py-4 rounded-xl text-fierce-cream text-base leading-relaxed resize-none"
            placeholder="A specific outcome you're after, a sensitive topic to avoid, an executive sponsor we should know about..."
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-12">
        <button
          onClick={onBack}
          className="text-fierce-cream/50 hover:text-fierce-cream/80 text-sm font-medium"
        >
          ← Back
        </button>
        <button
          onClick={() =>
            valid &&
            onSubmit({
              preferredWindow: window,
              notes: notes.trim(),
            })
          }
          disabled={!valid}
          className="btn-fierce bg-fierce-gradient text-fierce-black font-bold tracking-wide px-8 py-3.5 rounded-full disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          Submit →
        </button>
      </div>
    </div>
  );
}
