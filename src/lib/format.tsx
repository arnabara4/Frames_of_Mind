import type { ReactNode } from "react";

/**
 * Lightweight inline formatter: **bold**, *italic*, and line breaks.
 * Shared by the live editor preview and the published detail view so what you
 * type is exactly what readers see.
 */
export function renderRich(text: string | null | undefined): ReactNode {
  if (!text) return null;

  const lines = text.split("\n");
  return lines.map((line, li) => (
    <span key={li}>
      {formatInline(line)}
      {li < lines.length - 1 && <br />}
    </span>
  ));
}

function formatInline(line: string): ReactNode[] {
  // Split on **bold** and *italic* while keeping the delimiters.
  const tokens = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return tokens.map((tok, i) => {
    if (tok.startsWith("**") && tok.endsWith("**")) {
      return <strong key={i}>{tok.slice(2, -2)}</strong>;
    }
    if (tok.startsWith("*") && tok.endsWith("*")) {
      return <em key={i}>{tok.slice(1, -1)}</em>;
    }
    return <span key={i}>{tok}</span>;
  });
}
