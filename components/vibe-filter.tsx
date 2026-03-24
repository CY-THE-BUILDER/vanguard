"use client";

import { getUiCopy } from "@/lib/vanguard-i18n";
import { AppLocale, Vibe, vibeOptions } from "@/types/jazz";

type VibeFilterProps = {
  activeVibe: Vibe;
  onChange: (vibe: Vibe) => void;
  locale: AppLocale;
};

export function VibeFilter({ activeVibe, onChange, locale }: VibeFilterProps) {
  const copy = getUiCopy(locale);

  return (
    <div className="flex flex-wrap gap-2" aria-label={copy.heroEyebrow} role="tablist">
      {vibeOptions.map((vibe) => {
        const isActive = vibe === activeVibe;

        return (
          <button
            key={vibe}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(vibe)}
            className={`rounded-full border px-4 py-2 text-sm transition duration-300 ${
              isActive
                ? "border-olive-200 bg-olive-50 text-ink shadow-glow"
                : "border-white/10 bg-white/5 text-mist hover:border-white/20 hover:bg-white/10 hover:text-cream"
            }`}
          >
            {vibe}
          </button>
        );
      })}
    </div>
  );
}
