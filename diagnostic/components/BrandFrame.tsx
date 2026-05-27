export function FierceLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="inline-block w-3 h-3 bg-fierce-orange" />
      <span className="font-black tracking-tight text-fierce-cream text-lg">
        fierce<span className="text-fierce-orange">.</span>
      </span>
    </div>
  );
}

export function ProgressBar({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const pct = Math.min(100, Math.max(0, (current / total) * 100));
  return (
    <div className="w-full h-1 progress-track rounded-full overflow-hidden">
      <div
        className="h-full progress-fill rounded-full"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function CornerTriangle({
  position = "tl",
  size = 64,
  color = "#E67730",
}: {
  position?: "tl" | "tr" | "bl" | "br";
  size?: number;
  color?: string;
}) {
  const styles: React.CSSProperties = {
    position: "absolute",
    width: 0,
    height: 0,
    borderStyle: "solid",
  };
  if (position === "tl") {
    styles.top = 0;
    styles.left = 0;
    styles.borderWidth = `${size}px ${size}px 0 0`;
    styles.borderColor = `${color} transparent transparent transparent`;
  } else if (position === "tr") {
    styles.top = 0;
    styles.right = 0;
    styles.borderWidth = `${size}px 0 0 ${size}px`;
    styles.borderColor = `transparent transparent transparent ${color}`;
  } else if (position === "bl") {
    styles.bottom = 0;
    styles.left = 0;
    styles.borderWidth = `0 ${size}px ${size}px 0`;
    styles.borderColor = `transparent ${color} transparent transparent`;
  } else {
    styles.bottom = 0;
    styles.right = 0;
    styles.borderWidth = `0 0 ${size}px ${size}px`;
    styles.borderColor = `transparent transparent ${color} transparent`;
  }
  return <span style={styles} aria-hidden />;
}

export function GlowBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute -top-32 -right-40 w-[600px] h-[600px] rounded-full bg-fierce-orange opacity-[0.10] blur-[120px]" />
      <div className="absolute -bottom-32 -left-40 w-[500px] h-[500px] rounded-full bg-fierce-orange-deep opacity-[0.08] blur-[120px]" />
    </div>
  );
}
