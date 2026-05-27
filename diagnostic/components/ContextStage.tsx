"use client";

import { useState } from "react";
import type { ContextAnswers } from "@/lib/types";

export function ContextStage({
  initial,
  onSubmit,
  onBack,
}: {
  initial?: ContextAnswers;
  onSubmit: (ctx: ContextAnswers) => void;
  onBack: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [teamSize, setTeamSize] = useState(initial?.teamSize ?? "");

  const valid =
    name.trim().length > 0 &&
    /\S+@\S+\.\S+/.test(email) &&
    company.trim().length > 0 &&
    role.trim().length > 0 &&
    teamSize.length > 0;

  return (
    <div className="stage-enter max-w-2xl mx-auto pt-8">
      <p className="text-fierce-orange text-xs font-bold tracking-[0.25em] uppercase mb-3">
        Question 01
      </p>
      <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2 fierce-underline pb-3">
        Before we dig in — who are you and who&apos;s your team?
      </h2>
      <p className="text-fierce-cream/60 text-base md:text-lg mt-6 mb-10">
        Takes 20 seconds. We use this to tailor your recommendation and the
        workshop scope.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Your name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="fierce-input card-glow w-full px-4 py-3 rounded-lg text-fierce-cream"
            placeholder="Jess Tolon"
          />
        </Field>
        <Field label="Work email">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="fierce-input card-glow w-full px-4 py-3 rounded-lg text-fierce-cream"
            placeholder="you@company.com"
          />
        </Field>
        <Field label="Company">
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="fierce-input card-glow w-full px-4 py-3 rounded-lg text-fierce-cream"
            placeholder="Acme Industries"
          />
        </Field>
        <Field label="Your role">
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="fierce-input card-glow w-full px-4 py-3 rounded-lg text-fierce-cream"
            placeholder="VP of L&D"
          />
        </Field>
        <Field label="Team size for the workshop" className="md:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {["1–10", "11–25", "26–50", "51–100", "101–250", "250+", "Whole org", "Not sure yet"].map(
              (size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setTeamSize(size)}
                  className={`chip card-glow text-sm py-2.5 px-3 rounded-lg text-left ${
                    teamSize === size ? "selected" : ""
                  }`}
                >
                  {size}
                </button>
              )
            )}
          </div>
        </Field>
      </div>

      <NavButtons
        onBack={onBack}
        onNext={() =>
          valid && onSubmit({ name, email, company, role, teamSize })
        }
        nextDisabled={!valid}
      />
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-bold tracking-widest text-fierce-cream/50 uppercase mb-2">
        {label}
      </span>
      {children}
    </label>
  );
}

function NavButtons({
  onBack,
  onNext,
  nextDisabled,
  nextLabel = "Continue →",
}: {
  onBack?: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between mt-12">
      {onBack ? (
        <button
          onClick={onBack}
          className="text-fierce-cream/50 hover:text-fierce-cream/80 text-sm font-medium"
        >
          ← Back
        </button>
      ) : (
        <span />
      )}
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="btn-fierce bg-fierce-gradient text-fierce-black font-bold tracking-wide px-7 py-3 rounded-full disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
      >
        {nextLabel}
      </button>
    </div>
  );
}
