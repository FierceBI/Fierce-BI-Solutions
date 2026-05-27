"use client";

import { useEffect, useMemo, useState } from "react";
import { QUESTIONS } from "@/lib/archetypes";
import { scoreDiagnostic } from "@/lib/scoring";
import type {
  ContextAnswers,
  DiagnosticAnswers,
  ScopeAnswers,
  ScoringResult,
} from "@/lib/types";
import { FierceLogo, ProgressBar } from "@/components/BrandFrame";
import { IntroStage } from "@/components/IntroStage";
import { ContextStage } from "@/components/ContextStage";
import { QuestionStage } from "@/components/QuestionStage";
import { LogisticsStage } from "@/components/LogisticsStage";
import { ConfirmationStage } from "@/components/ConfirmationStage";

type Stage =
  | { kind: "intro" }
  | { kind: "context" }
  | { kind: "question"; index: number }
  | { kind: "logistics" }
  | { kind: "confirmation" };

type UtmParams = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  gclid?: string;
};

const QUESTION_LIST = QUESTIONS.filter((q) => q.type !== "context");
const TOTAL_STEPS = QUESTION_LIST.length + 3;

export default function Home() {
  const [stage, setStage] = useState<Stage>({ kind: "intro" });
  const [context, setContext] = useState<ContextAnswers | undefined>();
  const [responses, setResponses] = useState<DiagnosticAnswers["responses"]>({});
  const [scope, setScope] = useState<ScopeAnswers | undefined>();
  const [submitState, setSubmitState] =
    useState<"idle" | "sending" | "ok" | "error">("idle");
  const [utmParams, setUtmParams] = useState<UtmParams>({});

  // Capture UTM params from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utm: UtmParams = {};
    if (params.get("utm_source")) utm.utm_source = params.get("utm_source")!;
    if (params.get("utm_medium")) utm.utm_medium = params.get("utm_medium")!;
    if (params.get("utm_campaign")) utm.utm_campaign = params.get("utm_campaign")!;
    if (params.get("utm_content")) utm.utm_content = params.get("utm_content")!;
    if (params.get("gclid")) utm.gclid = params.get("gclid")!;
    setUtmParams(utm);
  }, []);

  const result: ScoringResult | null = useMemo(() => {
    if (!context) return null;
    if (Object.keys(responses).length < QUESTION_LIST.length) return null;
    return scoreDiagnostic({ context, responses });
  }, [context, responses]);

  function performSubmit() {
    if (!context || !result || !scope) return;
    setSubmitState("sending");
    fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        context,
        answers: responses,
        result,
        scope,
        utmParams,
        submittedAt: new Date().toISOString(),
      }),
    })
      .then((r) => (r.ok ? setSubmitState("ok") : setSubmitState("error")))
      .catch(() => setSubmitState("error"));
  }

  useEffect(() => {
    if (stage.kind === "confirmation" && submitState === "idle") {
      performSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  function progressStep(): number {
    if (stage.kind === "intro") return 0;
    if (stage.kind === "context") return 1;
    if (stage.kind === "question") return 2 + stage.index;
    if (stage.kind === "logistics") return 2 + QUESTION_LIST.length;
    return TOTAL_STEPS;
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <div className="relative z-10">
        <header className="px-6 md:px-10 pt-6 pb-2 flex items-center justify-between max-w-5xl mx-auto">
          <FierceLogo />
          <div className="text-xs tracking-widest text-fierce-cream/40 uppercase font-bold">
            Workshop Diagnostic
          </div>
        </header>

        {stage.kind !== "intro" && (
          <div className="px-6 md:px-10 max-w-5xl mx-auto pt-4">
            <ProgressBar current={progressStep()} total={TOTAL_STEPS} />
          </div>
        )}

        <section className="px-6 md:px-10 py-12 md:py-16">
          {stage.kind === "intro" && (
            <IntroStage onStart={() => setStage({ kind: "context" })} />
          )}

          {stage.kind === "context" && (
            <ContextStage
              initial={context}
              onBack={() => setStage({ kind: "intro" })}
              onSubmit={(c) => {
                setContext(c);
                setStage({ kind: "question", index: 0 });
              }}
            />
          )}

          {stage.kind === "question" && (
            <QuestionStage
              question={QUESTION_LIST[stage.index]}
              questionNumber={stage.index + 1}
              totalQuestions={QUESTION_LIST.length}
              initialValue={responses[QUESTION_LIST[stage.index].id]}
              onBack={() => {
                if (stage.index === 0) setStage({ kind: "context" });
                else setStage({ kind: "question", index: stage.index - 1 });
              }}
              onAnswer={(value: string | string[]) => {
                const qId = QUESTION_LIST[stage.index].id;
                setResponses((prev) => ({ ...prev, [qId]: value }));
                if (stage.index + 1 < QUESTION_LIST.length) {
                  setStage({ kind: "question", index: stage.index + 1 });
                } else {
                  setStage({ kind: "logistics" });
                }
              }}
            />
          )}

          {stage.kind === "logistics" && (
            <LogisticsStage
              initialScope={scope}
              onBack={() =>
                setStage({ kind: "question", index: QUESTION_LIST.length - 1 })
              }
              onSubmit={(s) => {
                setScope(s);
                setStage({ kind: "confirmation" });
              }}
            />
          )}

          {stage.kind === "confirmation" && result && context && scope && (
            <ConfirmationStage
              contactName={context.name}
              submitState={submitState === "idle" ? "sending" : submitState}
              onRetry={() => {
                setSubmitState("idle");
                performSubmit();
              }}
            />
          )}
        </section>

        <footer className="px-6 md:px-10 py-8 text-center text-xs text-fierce-cream/30 tracking-widest uppercase">
          any conversation <span className="text-fierce-orange">can</span>
        </footer>
      </div>
    </main>
  );
}
