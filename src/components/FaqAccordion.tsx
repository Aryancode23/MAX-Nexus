"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const categories = useMemo(() => ["All", ...Array.from(new Set(faqs.map((f) => f.category || "General")))], [faqs]);
  const [category, setCategory] = useState("All");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = category === "All" ? faqs : faqs.filter((f) => (f.category || "General") === category);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full border border-border px-3 py-1.5 text-sm ${category === c ? "bg-primary text-primary-foreground" : "bg-surface text-muted"}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-4 divide-y divide-border rounded-card border border-border bg-surface">
        {filtered.map((f) => (
          <div key={f.id}>
            <button
              onClick={() => setOpenId(openId === f.id ? null : f.id)}
              className="focus-ring flex w-full items-center justify-between gap-3 p-4 text-left text-sm font-medium text-text"
            >
              {f.question}
              <ChevronDown size={16} className={`shrink-0 text-muted transition-transform ${openId === f.id ? "rotate-180" : ""}`} />
            </button>
            {openId === f.id && <p className="px-4 pb-4 text-sm text-muted">{f.answer}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
