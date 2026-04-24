"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  describeScenario,
  type ReflexMode,
  sampleTrace,
  type StimulusKind,
  type TracePoint,
} from "@/lib/simulators/baroreceptor-model";
import { cn } from "@/lib/utils";

const STIMULI: ReadonlyArray<{ key: StimulusKind; label: string }> = [
  { key: "drop-30", label: "BP drop −30 mmHg" },
  { key: "drop-50", label: "BP drop −50 mmHg (haemorrhage)" },
  { key: "rise-30", label: "BP rise +30 mmHg" },
  { key: "rise-50", label: "BP rise +50 mmHg (crisis)" },
];

const MODES: ReadonlyArray<{ key: ReflexMode; label: string }> = [
  { key: "intact", label: "Intact" },
  { key: "partial", label: "Partial (stiff vessels)" },
  { key: "blocked", label: "Blocked (denervated)" },
];

const PLAY_DURATION_MS = 10_000; // play the 20 s trace over 10 s wall clock

export function BaroreceptorSimulator() {
  const [stimulus, setStimulus] = useState<StimulusKind>("drop-30");
  const [mode, setMode] = useState<ReflexMode>("intact");
  const [playhead, setPlayhead] = useState(0); // 0..1 of trace length
  const [playing, setPlaying] = useState(false);
  const rafRef = useRef<number | null>(null);
  const playStartRef = useRef<number | null>(null);

  const trace = useMemo(() => sampleTrace({ stimulus, mode }), [stimulus, mode]);

  // Reset playback whenever the scenario changes. Hooked into the onChange
  // handlers below rather than a useEffect — React 19's set-state-in-effect
  // lint disallows synchronous setState inside an effect body.
  function resetPlayback() {
    cancelAnimation();
    setPlayhead(0);
    setPlaying(false);
  }

  function cancelAnimation() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    playStartRef.current = null;
  }

  function play() {
    cancelAnimation();
    setPlaying(true);
    setPlayhead(0);
    const step = (timestamp: number) => {
      if (playStartRef.current === null) playStartRef.current = timestamp;
      const elapsed = timestamp - playStartRef.current;
      const progress = Math.min(1, elapsed / PLAY_DURATION_MS);
      setPlayhead(progress);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setPlaying(false);
      }
    };
    rafRef.current = requestAnimationFrame(step);
  }

  useEffect(() => () => cancelAnimation(), []);

  const cursorIndex = Math.min(trace.length - 1, Math.round(playhead * (trace.length - 1)));
  const current = trace[cursorIndex];

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Stimulus</legend>
        <div className="flex flex-wrap gap-2">
          {STIMULI.map((s) => (
            <label
              key={s.key}
              className={cn(
                "border-input hover:bg-muted cursor-pointer rounded-md border px-3 py-1.5 text-sm",
                stimulus === s.key ? "bg-secondary" : "",
              )}
            >
              <input
                type="radio"
                name="stim"
                value={s.key}
                className="sr-only"
                checked={stimulus === s.key}
                onChange={() => {
                  setStimulus(s.key);
                  resetPlayback();
                }}
              />
              {s.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Reflex state</legend>
        <div className="flex flex-wrap gap-2">
          {MODES.map((m) => (
            <label
              key={m.key}
              className={cn(
                "border-input hover:bg-muted cursor-pointer rounded-md border px-3 py-1.5 text-sm",
                mode === m.key ? "bg-secondary" : "",
              )}
            >
              <input
                type="radio"
                name="mode"
                value={m.key}
                className="sr-only"
                checked={mode === m.key}
                onChange={() => {
                  setMode(m.key);
                  resetPlayback();
                }}
              />
              {m.label}
            </label>
          ))}
        </div>
      </fieldset>

      <p className="text-muted-foreground text-xs leading-5">{describeScenario(stimulus, mode)}</p>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={play}
          disabled={playing}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {playing ? "Playing…" : playhead > 0 ? "Replay" : "Play"}
        </button>
        <div className="flex-1">
          <input
            type="range"
            min={0}
            max={1000}
            value={Math.round(playhead * 1000)}
            onChange={(e) => {
              cancelAnimation();
              setPlaying(false);
              setPlayhead(Number.parseInt(e.target.value, 10) / 1000);
            }}
            aria-label="Playback position"
            className="w-full"
          />
        </div>
        <span className="text-muted-foreground font-mono text-xs">
          t = {current.t.toFixed(1)} s
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TracePanel
          title="Mean arterial pressure"
          unit="mmHg"
          trace={trace}
          field="map"
          cursor={cursorIndex}
          min={40}
          max={180}
          colorClass="stroke-primary"
        />
        <TracePanel
          title="Baroreceptor firing"
          unit="impulses/s"
          trace={trace}
          field="firing"
          cursor={cursorIndex}
          min={0}
          max={150}
          colorClass="stroke-sky-500"
        />
        <TracePanel
          title="Heart rate"
          unit="bpm"
          trace={trace}
          field="hr"
          cursor={cursorIndex}
          min={40}
          max={140}
          colorClass="stroke-red-500"
        />
        <TracePanel
          title="Sympathetic activity"
          unit="(0–1)"
          trace={trace}
          field="sympathetic"
          cursor={cursorIndex}
          min={0}
          max={1}
          colorClass="stroke-amber-500"
        />
      </div>

      <aside className="text-muted-foreground border-t pt-4 text-xs leading-6">
        <p>
          <span className="font-medium">Teaching note.</span> Traces illustrate direction and
          timing, not quantitatively accurate patient data. The core lessons: firing rate is a
          sigmoidal function of MAP, the reflex response is seconds-fast, and blocking the reflex
          leaves the patient stuck at the perturbed pressure.
        </p>
      </aside>
    </div>
  );
}

function TracePanel({
  title,
  unit,
  trace,
  field,
  cursor,
  min,
  max,
  colorClass,
}: {
  title: string;
  unit: string;
  trace: TracePoint[];
  field: keyof Omit<TracePoint, "t">;
  cursor: number;
  min: number;
  max: number;
  colorClass: string;
}) {
  const W = 260;
  const H = 110;
  const pad = { top: 10, right: 10, bottom: 22, left: 36 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  function xAt(index: number) {
    return pad.left + (index / (trace.length - 1)) * plotW;
  }
  function yAt(v: number) {
    const pct = (v - min) / (max - min);
    return pad.top + (1 - pct) * plotH;
  }
  const d = trace
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(p[field] as number)}`)
    .join(" ");
  const c = trace[cursor];

  return (
    <section aria-label={title} className="border-border rounded-md border p-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-muted-foreground text-xs">{unit}</p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* axes */}
        <line
          x1={pad.left}
          y1={pad.top + plotH}
          x2={pad.left + plotW}
          y2={pad.top + plotH}
          className="stroke-border"
        />
        <line
          x1={pad.left}
          y1={pad.top}
          x2={pad.left}
          y2={pad.top + plotH}
          className="stroke-border"
        />
        {/* y labels (min, mid, max) */}
        {[min, (min + max) / 2, max].map((v) => (
          <g key={v}>
            <text
              x={pad.left - 4}
              y={yAt(v)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-muted-foreground text-[9px]"
            >
              {Number.isInteger(v) ? v : v.toFixed(1)}
            </text>
          </g>
        ))}
        {/* trace */}
        <path d={d} fill="none" strokeWidth={2} className={colorClass} />
        {/* cursor */}
        <line
          x1={xAt(cursor)}
          y1={pad.top}
          x2={xAt(cursor)}
          y2={pad.top + plotH}
          className="stroke-muted-foreground/40"
          strokeDasharray="3 3"
        />
        <circle cx={xAt(cursor)} cy={yAt(c[field] as number)} r={3.5} className={colorClass} />
        {/* x label */}
        <text
          x={pad.left + plotW / 2}
          y={H - 4}
          textAnchor="middle"
          className="fill-muted-foreground text-[9px]"
        >
          t (s): 0 — {Math.round(trace[trace.length - 1].t)}
        </text>
      </svg>
      <p className="text-sm">
        <span className="text-muted-foreground text-xs">current:</span>{" "}
        <span className="font-medium">
          {typeof c[field] === "number"
            ? (c[field] as number).toFixed(field === "sympathetic" ? 2 : 0)
            : ""}
        </span>{" "}
        <span className="text-muted-foreground text-xs">{unit}</span>
      </p>
    </section>
  );
}
