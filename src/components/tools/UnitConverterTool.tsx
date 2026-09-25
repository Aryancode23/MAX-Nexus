"use client";
import { useState } from "react";

const UNITS: Record<string, Record<string, number>> = {
  Length: { Meters: 1, Kilometers: 1000, Centimeters: 0.01, Miles: 1609.34, Feet: 0.3048, Inches: 0.0254 },
  Weight: { Kilograms: 1, Grams: 0.001, Pounds: 0.453592, Ounces: 0.0283495 },
};

export function UnitConverterTool() {
  const [category, setCategory] = useState<"Length" | "Weight" | "Temperature">("Length");
  const [from, setFrom] = useState("Meters");
  const [to, setTo] = useState("Feet");
  const [value, setValue] = useState("1");

  let result = "";
  if (category === "Temperature") {
    const v = Number(value);
    const celsius = from === "Celsius" ? v : from === "Fahrenheit" ? (v - 32) * 5 / 9 : v - 273.15;
    result = to === "Celsius" ? celsius.toFixed(2) : to === "Fahrenheit" ? (celsius * 9 / 5 + 32).toFixed(2) : (celsius + 273.15).toFixed(2);
  } else {
    const units = UNITS[category];
    result = ((Number(value) * units[from]) / units[to]).toFixed(4);
  }

  const options = category === "Temperature" ? ["Celsius", "Fahrenheit", "Kelvin"] : Object.keys(UNITS[category]);

  return (
    <div className="max-w-md space-y-4">
      <div className="flex gap-2">
        {(["Length", "Weight", "Temperature"] as const).map((c) => (
          <button
            key={c}
            onClick={() => {
              setCategory(c);
              setFrom(c === "Temperature" ? "Celsius" : Object.keys(UNITS[c])[0]);
              setTo(c === "Temperature" ? "Fahrenheit" : Object.keys(UNITS[c])[1]);
            }}
            className={`rounded-full border border-border px-3 py-1.5 text-sm ${category === c ? "bg-primary text-primary-foreground" : "bg-surface text-muted"}`}
          >
            {c}
          </button>
        ))}
      </div>
      <input type="number" value={value} onChange={(e) => setValue(e.target.value)} className="focus-ring w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
      <div className="grid grid-cols-2 gap-3">
        <select value={from} onChange={(e) => setFrom(e.target.value)} className="focus-ring rounded-control border border-border bg-surface px-3 py-2 text-sm">
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
        <select value={to} onChange={(e) => setTo(e.target.value)} className="focus-ring rounded-control border border-border bg-surface px-3 py-2 text-sm">
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>
      <div className="rounded-card border border-border bg-surface p-4 text-center text-2xl font-bold text-text">{result}</div>
    </div>
  );
}
