"use client";

import { useState } from "react";
import type { Question } from "@/lib/types";

export function QuestionStage({
  question,
  questionNumber,
  totalQuestions,
  initialValue,
  onAnswer,
  onBack,
}: {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  initialValue?: string | string[];
  onAnswer: (value: string | string[]) => void;
  onBack: () => void;
}) {
  const [textValue, setTextValue] = useState<string>(
    typeof initialValue === "string" ? initialValue : ""
  );
  const [singleChoice, setSingleChoice] = useState<string>(
    question.type === "chips_single" && typeof initialValue === "string"
      ? initialValue
      : ""
  );
  const [multiChoices, setMultiChoices] = useState<string[]>(
    question.type === "chips_multi" && Array.isArray(initialValue)
      ? initialValue
      : []
  );

  const cap = question.maxSelections ?? 3;

  const canContinue = (() => {
    if (question.type === "text") return textValue.trim().length >= 4;
    if (question.type === "chips_single") return singleChoice.length > 0;
    if (question.type === "chips_multi") return multiChoices.length > 0;
    return false;
  })();

  function submit() {
    if (!canContinue) return;
    if (question.type === "text") onAnswer(textValue.trim());
    else if (question.type === "chips_single") onAnswer(singleChoice);
    else if (question.type === "chips_multi") onAnswer(multiChoices);
  }

  function toggleMulti(id: string) {
    setMultiChoices((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= cap) return [...prev.slice(1), id];
      return [...prev, id];
    });
  }

  return (
    <div className="stage-enter max-w-2xl mx-auto pt-8">
      <p className="text-fierce-orange text-xs font-bold tracking-[0.25em] uppercase mb-3">
        Question {questionNumber} of {totalQuestions}
      </p>

      <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-[1.1] fierce-underline pb-3">
        {question.prompt}
      </h2>

      {question.helper && (
        <p className="text-fierce-cream/60 text-base md:text-lg mt-6 leading-relaxed">
          {question.helper}
        </p>
      )}

      <div className="mt-10">
        {question.type === "text" && (
          <textarea
            autoFocus
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            rows={5}
            className="fierce-input card-glow w-full px-5 py-4 rounded-xl text-fierce-cream text-base leading-relaxed resize-none"
            placeholder="What's the one that's been sitting with you?"
          />
        )}

        {question.type === "chips_single" && question.choices && (
          <div className="grid grid-cols-1 gap-3">
            {question.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => setSingleChoice(choice.id)}
                className={`chip card-glow text-left px-5 py-4 rounded-xl text-base text-fierce-cream leading-relaxed ${
                  singleChoice === choice.id ? "selected" : ""
                }`}
              >
                {choice.label}
              </button>
            ))}
          </div>
        )}

        {question.type === "chips_multi" && question.choices && (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-widest text-fierce-cream/40">
                {multiChoices.length} of {cap} selected
              </p>
              {multiChoices.length === cap && (
                <p className="text-xs text-fierce-orange/80">
                  Picking a new one will replace the oldest.
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 gap-3">
              {question.choices.map((choice) => {
                const idx = multiChoices.indexOf(choice.id);
                const selected = idx >= 0;
                return (
                  <button
                    key={choice.id}
                    onClick={() => toggleMulti(choice.id)}
                    className={`chip card-glow relative text-left px-5 py-4 rounded-xl text-base text-fierce-cream leading-relaxed ${
                      selected ? "selected" : ""
                    }`}
                  >
                    {selected && (
                      <span className="absolute top-3 right-3 inline-flex items-center justify-center w-6 h-6 rounded-full bg-fierce-gradient text-fierce-black text-xs font-black">
                        {idx + 1}
                      </span>
                    )}
                    <span className={selected ? "pr-8 block" : ""}>
                      {choice.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-between mt-12">
        <button
          onClick={onBack}
          className="text-fierce-cream/50 hover:text-fierce-cream/80 text-sm font-medium"
        >
          ← Back
        </button>
        <button
          onClick={submit}
          disabled={!canContinue}
          className="btn-fierce bg-fierce-gradient text-fierce-black font-bold tracking-wide px-7 py-3 rounded-full disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
