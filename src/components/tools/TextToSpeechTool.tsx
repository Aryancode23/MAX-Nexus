"use client";
import { useEffect, useState } from "react";
import { Play, Pause, Square } from "lucide-react";
import { Button } from "@/components/Button";

export function TextToSpeechTool() {
  const [text, setText] = useState("Type something for MAX Nexus to read aloud.");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceIndex, setVoiceIndex] = useState(0);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    function loadVoices() { setVoices(window.speechSynthesis.getVoices()); }
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  function play() {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    if (voices[voiceIndex]) utter.voice = voices[voiceIndex];
    utter.rate = rate;
    utter.pitch = pitch;
    utter.onend = () => { setSpeaking(false); setPaused(false); };
    window.speechSynthesis.speak(utter);
    setSpeaking(true);
    setPaused(false);
  }
  function pause() { window.speechSynthesis.pause(); setPaused(true); }
  function resume() { window.speechSynthesis.resume(); setPaused(false); }
  function stop() { window.speechSynthesis.cancel(); setSpeaking(false); setPaused(false); }

  return (
    <div className="max-w-xl space-y-5">
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} className="focus-ring w-full rounded-card border border-border bg-surface p-4 text-sm" />

      <label className="block text-sm">
        Voice
        <select value={voiceIndex} onChange={(e) => setVoiceIndex(Number(e.target.value))} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm">
          {voices.map((v, i) => (<option key={i} value={i}>{v.name} ({v.lang})</option>))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm">Rate ({rate.toFixed(1)}x)<input type="range" min={0.5} max={2} step={0.1} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="mt-1 w-full" /></label>
        <label className="block text-sm">Pitch ({pitch.toFixed(1)})<input type="range" min={0} max={2} step={0.1} value={pitch} onChange={(e) => setPitch(Number(e.target.value))} className="mt-1 w-full" /></label>
      </div>

      <div className="flex gap-3">
        {!speaking && <Button onClick={play}><Play size={16} /> Play</Button>}
        {speaking && !paused && <Button onClick={pause} variant="secondary"><Pause size={16} /> Pause</Button>}
        {speaking && paused && <Button onClick={resume}><Play size={16} /> Resume</Button>}
        {speaking && <Button onClick={stop} variant="secondary"><Square size={16} /> Stop</Button>}
      </div>
      <p className="text-xs text-muted">Uses your browser's built-in speech voices — available voices vary by device and browser.</p>
    </div>
  );
}
