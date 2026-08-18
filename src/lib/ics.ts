/**
 * Minimal RFC 5545 (iCalendar) writer — just enough to export a flat list
 * of appointments as a .ics file interpreters/office staff can subscribe
 * to or import into their own phone/desktop calendar. No external
 * dependency; the format is small enough to hand-roll correctly.
 */

export type IcsEvent = {
  uid: string;
  summary: string;
  start: Date;
  end: Date;
  location?: string;
  description?: string;
};

function escapeText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/** Floating local time, no timezone conversion — matches how job dates/times are entered and displayed elsewhere in the app. */
function formatIcsDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(
    d.getMinutes()
  )}${pad(d.getSeconds())}`;
}

/** Wraps long lines at 75 octets per RFC 5545 §3.1 (folding). */
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let rest = line;
  while (rest.length > 75) {
    parts.push(rest.slice(0, 75));
    rest = " " + rest.slice(75);
  }
  parts.push(rest);
  return parts.join("\r\n");
}

export function buildIcsCalendar(calendarName: string, events: IcsEvent[]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SV24 OS//Kalender-Export//DE",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${escapeText(calendarName)}`,
    ...events.flatMap((e) => [
      "BEGIN:VEVENT",
      `UID:${e.uid}@sv24-os`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `DTSTART:${formatIcsDate(e.start)}`,
      `DTEND:${formatIcsDate(e.end)}`,
      `SUMMARY:${escapeText(e.summary)}`,
      ...(e.location ? [`LOCATION:${escapeText(e.location)}`] : []),
      ...(e.description ? [`DESCRIPTION:${escapeText(e.description)}`] : []),
      "END:VEVENT",
    ]),
    "END:VCALENDAR",
  ];
  return lines.map(foldLine).join("\r\n") + "\r\n";
}
