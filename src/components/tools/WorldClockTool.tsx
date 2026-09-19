"use client";
import { useState, useEffect } from "react";

const ALL_ZONES = [
  { label: "India (IST)", tz: "Asia/Kolkata" },
  { label: "New York (ET)", tz: "America/New_York" },
  { label: "Los Angeles (PT)", tz: "America/Los_Angeles" },
  { label: "London (UK)", tz: "Europe/London" },
  { label: "Dubai (UAE)", tz: "Asia/Dubai" },
  { label: "Singapore", tz: "Asia/Singapore" },
  { label: "Tokyo (Japan)", tz: "Asia/Tokyo" },
  { label: "Sydney (Australia)", tz: "Australia/Sydney" },
  { label: "Paris (CET)", tz: "Europe/Paris" },
  { label: "Moscow", tz: "Europe/Moscow" },
];

export function WorldClockTool() {
  const [now, setNow] = useState(new Date());
  const [selected, setSelected] = useState<string[]>(["Asia/Kolkata", "America/New_York", "Europe/London", "Asia/Dubai"]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  function toggle(tz: string) {
    setSelected((s) => (s.includes(tz) ? s.filter((z) => z !== tz) : [...s, tz]));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {ALL_ZONES.map((z) => (
          <button key={z.tz} onClick={() => toggle(z.tz)} className={`rounded-full border border-border px-3 py-1.5 text-xs ${selected.includes(z.tz) ? "bg-primary text-primary-foreground" : "bg-surface text-muted"}`}>{z.label}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ALL_ZONES.filter((z) => selected.includes(z.tz)).map((z) => (
          <div key={z.tz} className="rounded-card border border-border bg-surface p-4 text-center">
            <p className="text-xs text-muted">{z.label}</p>
            <p className="mt-1 text-lg font-bold text-text">{now.toLocaleTimeString("en-US", { timeZone: z.tz, hour: "2-digit", minute: "2-digit", second: "2-digit" })}</p>
            <p className="text-[10px] text-muted">{now.toLocaleDateString("en-US", { timeZone: z.tz, weekday: "short", month: "short", day: "numeric" })}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
