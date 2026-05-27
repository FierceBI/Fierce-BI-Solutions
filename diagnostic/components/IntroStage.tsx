"use client";

export function IntroStage({ onStart }: { onStart: () => void }) {
  return (
    <div className="stage-enter max-w-3xl mx-auto text-center space-y-10 pt-8">
      <p className="text-fierce-orange text-sm font-bold tracking-[0.25em] uppercase">
        Fierce Diagnostic
      </p>

      <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.95]">
        Before we build your team a workshop,
        <br />
        <span className="headline-accent">let&apos;s be honest.</span>
      </h1>

      <p className="text-fierce-cream/70 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
        The next few questions shape the session Regent builds for your team.
      </p>

      <div className="pt-4 flex flex-col items-center gap-3">
        <button
          onClick={onStart}
          className="btn-fierce bg-fierce-gradient text-fierce-black font-bold text-base tracking-wide px-10 py-4 rounded-full"
        >
          Start the conversation →
        </button>
        <p className="text-fierce-cream/40 text-xs">
          Your answers stay between you and your facilitator.
        </p>
      </div>

      <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <Pillar
          number="01"
          title="Honest"
          body="No leading questions. We're trying to find what's actually true on your team."
        />
        <Pillar
          number="02"
          title="Specific"
          body="A precise diagnosis beats a generic workshop every time. So we ask precise questions."
        />
        <Pillar
          number="03"
          title="Actionable"
          body="Within 24 hours, we review your answers and reach out to plan your in-person workshop."
        />
      </div>
    </div>
  );
}

function Pillar({
  number,
  title,
  body,
}: {
  number: string;
  title: string;
  body: string;
}) {
  return (
    <div className="card-glow rounded-xl p-5 bg-fierce-ink/40 backdrop-blur-sm">
      <p className="text-fierce-orange font-mono text-xs tracking-widest mb-2">
        {number}
      </p>
      <p className="font-bold text-fierce-cream mb-1.5">{title}</p>
      <p className="text-sm text-fierce-cream/60 leading-relaxed">{body}</p>
    </div>
  );
}
