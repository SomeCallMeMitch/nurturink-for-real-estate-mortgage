import React from "react";

/**
 * PillVisualReference
 * - Matches the "squared pill" look you already have (rounded-md, compact, higher contrast).
 * - Uses CSS vars so it respects whitelabel + dark mode.
 *
 * Required CSS vars (with fallbacks below):
 *  --pill-success-bg / --pill-success-fg
 *  --pill-warning-bg / --pill-warning-fg
 *  --pill-danger-bg / --pill-danger-fg
 *  --pill-muted-bg / --pill-muted-fg
 *
 *  --pill-color1-bg / --pill-color1-fg
 *  --pill-color2-bg / --pill-color2-fg
 *  --pill-color3-bg / --pill-color3-fg
 */

function Pill({ children, variant = "muted", size = "md" }) {
  const sizeClass =
    size === "sm"
      ? "text-[11px] px-2 py-[2px]"
      : "text-xs px-2.5 py-1";

  const palette = {
    success: {
      bg: "var(--pill-success-bg, #DCFCE7)",
      fg: "var(--pill-success-fg, #166534)",
      bd: "var(--pill-success-bd, rgba(22, 101, 52, 0.15))",
    },
    warning: {
      bg: "var(--pill-warning-bg, #FEF3C7)",
      fg: "var(--pill-warning-fg, #92400E)",
      bd: "var(--pill-warning-bd, rgba(146, 64, 14, 0.16))",
    },
    danger: {
      bg: "var(--pill-danger-bg, #FEE2E2)",
      fg: "var(--pill-danger-fg, #991B1B)",
      bd: "var(--pill-danger-bd, rgba(153, 27, 27, 0.16))",
    },
    muted: {
      bg: "var(--pill-muted-bg, #E5E7EB)",
      fg: "var(--pill-muted-fg, #374151)",
      bd: "var(--pill-muted-bd, rgba(55, 65, 81, 0.14))",
    },

    // Utility / custom pills (Color 1–3)
    color1: {
      bg: "var(--pill-color1-bg, #DBEAFE)",
      fg: "var(--pill-color1-fg, #1D4ED8)",
      bd: "var(--pill-color1-bd, rgba(29, 78, 216, 0.18))",
    },
    color2: {
      bg: "var(--pill-color2-bg, #EDE9FE)",
      fg: "var(--pill-color2-fg, #6D28D9)",
      bd: "var(--pill-color2-bd, rgba(109, 40, 217, 0.18))",
    },
    color3: {
      bg: "var(--pill-color3-bg, #CCFBF1)",
      fg: "var(--pill-color3-fg, #0F766E)",
      bd: "var(--pill-color3-bd, rgba(15, 118, 110, 0.18))",
    },
  };

  const c = palette[variant] || palette.muted;

  return (
    <span
      className={[
        "inline-flex items-center gap-1",
        "rounded-md",
        "font-medium",
        "leading-none",
        "border",
        sizeClass,
      ].join(" ")}
      style={{
        background: c.bg,
        color: c.fg,
        borderColor: c.bd,
      }}
    >
      {children}
    </span>
  );
}

export default function PillVisualReference() {
  return (
    <div className="w-full rounded-xl border bg-white p-6">
      <div className="text-lg font-semibold">Pill Visual Reference</div>
      <div className="text-sm text-gray-500 mt-1">
        Matches the existing "squared pill" style (compact, rounded-md, higher-contrast).
      </div>

      <div className="mt-6 space-y-6">
        {/* Semantic */}
        <section>
          <div className="text-sm font-medium text-gray-700">Semantic Pills</div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Pill variant="success">Active</Pill>
            <Pill variant="warning">Member</Pill>
            <Pill variant="danger">Error</Pill>
            <Pill variant="muted">Muted</Pill>
          </div>
        </section>

        {/* Utility */}
        <section>
          <div className="text-sm font-medium text-gray-700">Utility Pills (Color 1–3)</div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Pill variant="color1">Color 1</Pill>
            <Pill variant="color2">Color 2</Pill>
            <Pill variant="color3">Color 3</Pill>
          </div>
        </section>

        {/* Dense / table */}
        <section>
          <div className="text-sm font-medium text-gray-700">Dense / Table Context</div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Pill variant="color2" size="sm">Admin</Pill>
            <Pill variant="success" size="sm">Active</Pill>
            <Pill variant="warning" size="sm">Lead Nurture</Pill>
            <Pill variant="color1" size="sm">Organization</Pill>
          </div>
        </section>
      </div>
    </div>
  );
}