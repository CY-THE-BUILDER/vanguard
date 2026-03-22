"use client";

type VinylSpinnerProps = {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "h-10 w-10",
  md: "h-14 w-14",
  lg: "h-20 w-20"
} satisfies Record<NonNullable<VinylSpinnerProps["size"]>, string>;

export function VinylSpinner({
  label = "正在載入推薦專輯",
  size = "md",
  className = ""
}: VinylSpinnerProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full ${sizeClasses[size]} ${className}`.trim()}
      role="status"
      aria-label={label}
    >
      <div className="vinyl-disc absolute inset-0 rounded-full" />
      <div className="vinyl-groove absolute inset-[18%] rounded-full border border-white/10" />
      <div className="vinyl-groove absolute inset-[31%] rounded-full border border-white/10" />
      <div className="vinyl-core absolute inset-[42%] rounded-full bg-olive-50/90 shadow-[0_0_0_6px_rgba(245,239,223,0.08)]" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
