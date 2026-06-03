import React from "react";

/**
 * notification-body.tsx
 *
 * Shared presentation utilities for notification body text.
 *
 * Design decisions:
 * ─────────────────
 * 1. BiDi isolation via <bdi>
 *    Mixed Arabic (RTL) and Latin/numeric (LTR) tokens inside a single
 *    paragraph cause the Unicode Bidirectional Algorithm to shift punctuation
 *    and flip date delimiters unless each token is explicitly scoped.
 *    We wrap alphanumeric spans (booking IDs, dates, English names, numbers)
 *    inside <bdi> elements so the browser treats each as an isolated script
 *    region while the surrounding Arabic text remains RTL-anchored.
 *
 * 2. Structural sentence splitting
 *    Arabic prose commonly uses ، (U+060C) as an intra-sentence separator
 *    and . or \n as hard breaks. Splitting on these produces individual
 *    vertical fragments that are much easier to scan than a single dense wall.
 *
 * 3. Pill badges for codes
 *    Patterns matching booking IDs (BK-NNNN), hyphenated dates, and isolated
 *    all-caps codes receive an extra visual badge (subtle bg, monospace) to
 *    make operational metrics instantly distinguishable.
 *
 * 4. No dangerouslySetInnerHTML
 *    All HTML is constructed via React.createElement / JSX so there is zero
 *    injection risk. Input text is treated as plain-text data at all times.
 *
 * 5. No backend changes
 *    This module is purely presentational. Template definitions in
 *    NotificationTemplateRegistry.cs are untouched.
 */

// ─── Token classification ────────────────────────────────────────────────────

/**
 * Regex that matches tokens which should receive BiDi isolation.
 *
 * Groups:
 *  code   – booking / reference codes like BK-9982, INV-001
 *  date   – ISO dates (2026-07-01) or localised hyphen-dates (10-06-2026)
 *  eng    – sequences of Latin letters (English names, words)
 *  num    – standalone integers or decimals
 */
const BIDI_TOKEN_RE =
  /(?<code>[A-Z]{2,}-\d+)|(?<date>\d{1,4}-\d{1,2}-\d{1,4})|(?<num>\d+(?:[.,]\d+)*)|(?<eng>[A-Za-z][A-Za-z]*)/g;

type TokenKind = "code" | "date" | "eng" | "num" | "text";

interface Segment {
  kind: TokenKind;
  value: string;
}

/** Split a raw body string into classified segments for rendering. */
function tokenise(text: string): Segment[] {
  const segments: Segment[] = [];
  let lastIndex = 0;

  // Reset regex state (global flag)
  BIDI_TOKEN_RE.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = BIDI_TOKEN_RE.exec(text)) !== null) {
    // Plain Arabic text before this match
    if (match.index > lastIndex) {
      segments.push({ kind: "text", value: text.slice(lastIndex, match.index) });
    }

    const groups = match.groups ?? {};
    const kind: TokenKind = groups.code
      ? "code"
      : groups.date
      ? "date"
      : groups.eng
      ? "eng"
      : "num";

    segments.push({ kind, value: match[0] });
    lastIndex = BIDI_TOKEN_RE.lastIndex;
  }

  // Trailing Arabic text
  if (lastIndex < text.length) {
    segments.push({ kind: "text", value: text.slice(lastIndex) });
  }

  return segments;
}

// ─── Inline token renderer ────────────────────────────────────────────────────

function renderSegment(seg: Segment, idx: number): React.ReactNode {
  if (seg.kind === "text") {
    return <React.Fragment key={idx}>{seg.value}</React.Fragment>;
  }

  if (seg.kind === "code") {
    // Pill badge — monospace, slightly elevated contrast
    return (
      <bdi
        key={idx}
        className="mx-0.5 inline-flex items-center rounded bg-amber-50 px-1.5 py-0.5 font-mono text-[0.8em] font-semibold tracking-wide text-amber-700 ring-1 ring-inset ring-amber-200"
      >
        {seg.value}
      </bdi>
    );
  }

  if (seg.kind === "date") {
    // Dates — monospace, neutral pill so delimiters don't flip
    return (
      <bdi
        key={idx}
        className="mx-0.5 inline-flex items-center rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[0.8em] font-medium tracking-wide text-neutral-600"
      >
        {seg.value}
      </bdi>
    );
  }

  // English words / numbers — simple bdi isolation, semibold weight
  return (
    <bdi
      key={idx}
      className="font-semibold tracking-wide"
    >
      {seg.value}
    </bdi>
  );
}

// ─── Sentence splitter ───────────────────────────────────────────────────────

/**
 * Split on:
 *  • Arabic comma ، (U+060C)
 *  • Full stop .
 *  • Explicit newlines \n
 *
 * Returns non-empty fragments only.
 */
const SENTENCE_SPLIT_RE = /[،\n]|(?<=\.\s)/u;

function splitSentences(text: string): string[] {
  return text
    .split(SENTENCE_SPLIT_RE)
    .map((s) => s.trim())
    .filter(Boolean);
}

// ─── Public component ─────────────────────────────────────────────────────────

interface NotificationBodyRendererProps {
  /** The compiled notification body string from the API. */
  body: string | null | undefined;
  /**
   * When true (default), split the body into vertically stacked sentence
   * fragments for maximum readability. Set to false to keep as a single block
   * (used in compact list previews).
   */
  structured?: boolean;
  /** Extra className applied to the outermost container. */
  className?: string;
}

/**
 * NotificationBodyRenderer
 *
 * Renders a compiled notification body string with:
 *  • Proper RTL directionality anchoring (dir="rtl")
 *  • <bdi> isolation for all Latin/numeric tokens
 *  • Pill badges for booking codes and dates
 *  • Optional structured sentence splitting for the detail view
 */
export function NotificationBodyRenderer({
  body,
  structured = true,
  className = "",
}: NotificationBodyRendererProps) {
  if (!body) {
    return (
      <p className={`text-sm text-neutral-400 italic ${className}`}>
        لا يوجد محتوى للرسالة.
      </p>
    );
  }

  const baseClass = [
    "text-sm leading-loose text-neutral-700 text-right antialiased",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (structured) {
    const fragments = splitSentences(body);

    // If splitting yields only one fragment (body is a single sentence),
    // render a single paragraph to avoid unnecessary wrapping overhead.
    if (fragments.length <= 1) {
      const segments = tokenise(body);
      return (
        <p dir="rtl" className={baseClass}>
          {segments.map(renderSegment)}
        </p>
      );
    }

    return (
      <ul dir="rtl" className={`space-y-2 list-none p-0 ${className}`}>
        {fragments.map((fragment, i) => {
          const segments = tokenise(fragment);
          return (
            <li
              key={i}
              className="flex items-start gap-2 text-sm leading-loose text-neutral-700 text-right"
            >
              {/* Subtle vertical accent bullet */}
              <span
                className="mt-2 flex-shrink-0 h-1.5 w-1.5 rounded-full bg-primary-400 opacity-70"
                aria-hidden="true"
              />
              <span className="flex-1">{segments.map(renderSegment)}</span>
            </li>
          );
        })}
      </ul>
    );
  }

  // Compact (non-structured) — single paragraph, no splitting
  const segments = tokenise(body);
  return (
    <p dir="rtl" className={baseClass}>
      {segments.map(renderSegment)}
    </p>
  );
}
