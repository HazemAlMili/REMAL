import React from "react";

/**
 * notification-body.tsx
 *
 * Renders a compiled notification body string for the portals.
 *
 * Directionality
 * ──────────────
 * Bodies are authored in English today (the `NotificationTemplateRegistry`
 * templates) but the platform is Egyptian and Arabic copy may land later. So we
 * render with **`dir="auto"`** and logical `text-start` alignment: the browser
 * picks LTR for English and RTL for Arabic per content, with no scrambling.
 *
 * Earlier this module forced `dir="rtl"`, isolated every word in its own
 * `<bdi>`, and split sentences into reversed bullet fragments — which turned
 * the English templates into unreadable word-salad. That is removed. We now
 * only give genuine reference codes and ISO dates a subtle inline pill, kept in
 * document order, so they stay scannable without distorting the sentence.
 *
 * The text is always treated as plain data (no `dangerouslySetInnerHTML`).
 */

// Reference codes (BK-9982, INV-001) and ISO dates (2026-07-01) get a pill.
const TOKEN_RE = /(?<code>\b[A-Z]{2,}-\d+\b)|(?<date>\b\d{4}-\d{2}-\d{2}\b)/g;

function renderWithTokens(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  TOKEN_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = TOKEN_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const isCode = Boolean(match.groups?.code);
    nodes.push(
      <bdi
        key={key++}
        className={
          isCode
            ? "mx-0.5 inline-flex items-center rounded bg-primary-50 px-1.5 py-0.5 font-mono text-[0.85em] font-medium text-primary-700"
            : "mx-0.5 inline-flex items-center rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[0.85em] tabular-nums text-neutral-600"
        }
      >
        {match[0]}
      </bdi>
    );
    lastIndex = TOKEN_RE.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

interface NotificationBodyRendererProps {
  /** The compiled notification body string from the API. */
  body: string | null | undefined;
  /**
   * `true` (default) for the detail view: relaxed leading and preserved line
   * breaks. `false` for compact list previews (tighter, meant to be clamped by
   * the caller).
   */
  structured?: boolean;
  /** Extra classes applied to the rendered paragraph. */
  className?: string;
}

export function NotificationBodyRenderer({
  body,
  structured = true,
  className = "",
}: NotificationBodyRendererProps) {
  if (!body) {
    return (
      <p className={`text-sm italic text-neutral-400 ${className}`}>
        No message content.
      </p>
    );
  }

  const classes = [
    "text-start text-neutral-700 break-words",
    structured ? "text-sm leading-relaxed whitespace-pre-line" : "text-xs leading-snug",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <p dir="auto" className={classes}>
      {renderWithTokens(body)}
    </p>
  );
}
