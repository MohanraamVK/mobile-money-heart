import { useEffect, useState } from "react";
import { ALL_THEMES, HOLIDAYS, type HolidayOverlayId } from "@/lib/banking/themes";
import type { LunarState } from "@/lib/banking/types";

interface Props {
  themeId: string;
  customThemeImage?: string;
  holiday: HolidayOverlayId;
  lunar: LunarState;
}

/**
 * Renders the *image backdrop* for the active theme plus an optional animated
 * holiday overlay. Lives behind the dashboard content (z-0, fixed).
 */
export function ThemeBackground({ themeId, customThemeImage, holiday, lunar }: Props) {
  const themeImage =
    customThemeImage ?? ALL_THEMES.find((t) => t.id === themeId)?.image ?? null;

  return (
    <>
      {themeImage && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            backgroundImage: `url(${themeImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.18,
            filter: "saturate(1.1)",
          }}
        />
      )}
      {themeImage && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background:
              "linear-gradient(to bottom, color-mix(in oklab, var(--background) 85%, transparent), color-mix(in oklab, var(--background) 95%, transparent))",
          }}
        />
      )}
      {holiday !== "none" && lunar.animationsEnabled && <HolidayOverlay holiday={holiday} />}
    </>
  );
}

function HolidayOverlay({ holiday }: { holiday: HolidayOverlayId }) {
  if (holiday === "christmas") return <SnowOverlay />;
  if (holiday === "easter") return <FallingOverlay items={["🥚", "🐰", "🌷", "🐣"]} count={28} />;
  if (holiday === "midsummer") return <FallingOverlay items={["🌼", "💐", "🌸", "🪻", "🌿"]} count={36} />;
  return null;
}

function SnowOverlay() {
  const flakes = Array.from({ length: 80 }, (_, i) => i);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[5] overflow-hidden">
      {flakes.map((i) => {
        const left = (i * 53) % 100;
        const delay = (i * 0.37) % 8;
        const dur = 6 + ((i * 7) % 10);
        const size = 6 + ((i * 3) % 10);
        const opacity = 0.4 + ((i * 11) % 6) / 10;
        return (
          <span
            key={i}
            className="absolute top-[-20px] block rounded-full bg-white"
            style={{
              left: `${left}%`,
              width: size,
              height: size,
              opacity,
              animation: `lunar-snow ${dur}s linear ${delay}s infinite`,
              boxShadow: "0 0 6px rgba(255,255,255,0.6)",
            }}
          />
        );
      })}
    </div>
  );
}

function FallingOverlay({ items, count }: { items: string[]; count: number }) {
  const all = Array.from({ length: count }, (_, i) => i);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[5] overflow-hidden">
      {all.map((i) => {
        const left = (i * 41) % 100;
        const delay = (i * 0.41) % 10;
        const dur = 8 + ((i * 5) % 12);
        const size = 18 + ((i * 4) % 14);
        const item = items[i % items.length];
        const sway = (i % 2 === 0 ? "lunar-fall-a" : "lunar-fall-b");
        return (
          <span
            key={i}
            className="absolute top-[-30px] block select-none"
            style={{
              left: `${left}%`,
              fontSize: size,
              animation: `${sway} ${dur}s linear ${delay}s infinite`,
            }}
          >
            {item}
          </span>
        );
      })}
    </div>
  );
}

/** Tiny helper hook: returns the holiday id for the picker fallback popup. */
export function useHolidayFromList(): typeof HOLIDAYS {
  const [list, setList] = useState(HOLIDAYS);
  useEffect(() => setList(HOLIDAYS), []);
  return list;
}
