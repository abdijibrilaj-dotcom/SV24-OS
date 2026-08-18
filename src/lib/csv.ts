/**
 * Minimal CSV writer (RFC 4180-ish): quotes any field containing a comma,
 * quote, or newline and doubles internal quotes. Good enough for the
 * Excel-based invoice-checking workflows German public-sector accounting
 * departments typically use — no external dependency needed for this.
 */
export function csvEscape(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsv(rows: (string | number)[][]): string {
  // Leading BOM so Excel on Windows opens UTF-8 umlauts correctly instead
  // of mangling them.
  return "﻿" + rows.map((row) => row.map(csvEscape).join(",")).join("\r\n") + "\r\n";
}
