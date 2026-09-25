"use client";

import { useMemo, useState } from "react";

export function WordCounterTool() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const sentences = text.trim() ? (text.match(/[.!?]+(\s|$)/g)?.length ?? (text.trim() ? 1 : 0)) : 0;
    const readingMinutes = Math.max(1, Math.round(words / 200));
    return { words, characters, charactersNoSpaces, sentences, readingMinutes };
  }, [text]);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={14}
          placeholder="Paste or type your text here…"
          className="focus-ring w-full rounded-card border border-border bg-surface p-4 text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-3 self-start md:grid-cols-1">
        <Stat label="Words" value={stats.words} />
        <Stat label="Characters" value={stats.characters} />
        <Stat label="Characters (no spaces)" value={stats.charactersNoSpaces} />
        <Stat label="Sentences" value={stats.sentences} />
        <Stat label="Reading time" value={`~${stats.readingMinutes} min`} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-card border border-border bg-surface p-4 text-center">
      <p className="text-2xl font-bold text-text">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
