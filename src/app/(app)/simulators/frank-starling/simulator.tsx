"use client";

import { useMemo, useState } from "react";

import {
  classifyEjectionFraction,
  CONTRACTILITY_PARAMS,
  ejectionFraction,
  sampleCurve,
  strokeVolume,
  type Contractility,
} from "@/lib/simulators/frank-starling-model";
import { cn } from "@/lib/utils";

const EDV_MIN = 50;
const EDV_MAX = 250;
const EDV_DEFAULT = 120;

const CONTRACTILITY_ORDER: ReadonlyArray<{
  key: Contractility;
  label: string;
  description: string;
}> = [
  { key: "failing", label: "Failing", description: "Reduced svMax, flatter curve" },
  { key: "normal", label: "Normal", description: "Healthy adult baseline" },
  {
    key: "enhanced",
    label: "Enhanced",
    description: "Inotrope or exercise-mediated sympathetic drive",
  },
];

/**
 * Interactive Frank-Starling plot.
 *
 * Left: SVG curve showing the currently-selected contractility plus the
 * normal reference in grey for contrast. A filled circle marks the
 * (EDV, SV) of the current slider position.
 *
 * Right: numerical readout — SV, EF, EF classification.
 *
 * The math lives in `src/lib/simulators/frank-starling-model.ts` and is
 * unit-tested. This component is presentation-only.
 */
export function FrankStarlingSimulator() {
  const [edv, setEdv] = useState(EDV_DEFAULT);
  const [contractility, setContractility] = useState<Contractility>("normal");

  const normalSamples = useMemo(() => sampleCurve("normal"), []);
  const activeSamples = useMemo(() => sampleCurve(contractility), [contractility]);
  const sv = strokeVolume(edv, contractility);
  const ef = ejectionFraction(edv, sv);
  const efLabel = classifyEjectionFraction(ef);

  // SVG layout — we project EDV onto x in [0, WIDTH] and SV onto y in
  // [0, HEIGHT] with y inverted.
  const WIDTH = 520;
  const HEIGHT = 300;
  const MARGIN = { top: 20, right: 20, bottom: 40, left: 50 };
  const plotW = WIDTH - MARGIN.left - MARGIN.right;
  const plotH = HEIGHT - MARGIN.top - MARGIN.bottom;
  const svMaxAxis = Math.max(
    CONTRACTILITY_PARAMS.enhanced.svMax,
    CONTRACTILITY_PARAMS.normal.svMax,
  );
  const svAxisTop = Math.ceil(svMaxAxis * 1.1);

  function x(edvMl: number) {
    const pct = (edvMl - EDV_MIN) / (EDV_MAX - EDV_MIN);
    return MARGIN.left + pct * plotW;
  }
  function y(svMl: number) {
    const pct = svMl / svAxisTop;
    return MARGIN.top + (1 - pct) * plotH;
  }
  function path(samples: { edvMl: number; svMl: number }[]) {
    if (samples.length === 0) return "";
    const parts = samples.map((s, i) => `${i === 0 ? "M" : "L"} ${x(s.edvMl)} ${y(s.svMl)}`);
    return parts.join(" ");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <label htmlFor="edv-slider" className="text-sm font-medium">
          End-diastolic volume: {Math.round(edv)} mL
        </label>
        <input
          id="edv-slider"
          type="range"
          min={EDV_MIN}
          max={EDV_MAX}
          step={1}
          value={edv}
          onChange={(e) => setEdv(Number.parseInt(e.target.value, 10))}
          className="w-full"
        />
        <div className="text-muted-foreground flex justify-between text-xs">
          <span>{EDV_MIN} mL</span>
          <span>(physiologic ~100–120 mL)</span>
          <span>{EDV_MAX} mL</span>
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Contractility</legend>
        <div className="flex flex-wrap gap-2">
          {CONTRACTILITY_ORDER.map((c) => (
            <label
              key={c.key}
              className={cn(
                "border-input hover:bg-muted flex cursor-pointer items-start gap-2 rounded-md border px-3 py-2 text-sm",
                contractility === c.key ? "bg-secondary" : "",
              )}
            >
              <input
                type="radio"
                name="contractility"
                value={c.key}
                checked={contractility === c.key}
                onChange={() => setContractility(c.key)}
                className="mt-1"
              />
              <span className="flex flex-col gap-0.5">
                <span className="font-medium">{c.label}</span>
                <span className="text-muted-foreground text-xs">{c.description}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="border-border rounded-md border p-4">
        <svg
          role="img"
          aria-label="Frank-Starling curve plot"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full"
        >
          {/* Axes */}
          <line
            x1={MARGIN.left}
            y1={MARGIN.top + plotH}
            x2={MARGIN.left + plotW}
            y2={MARGIN.top + plotH}
            className="stroke-border"
          />
          <line
            x1={MARGIN.left}
            y1={MARGIN.top}
            x2={MARGIN.left}
            y2={MARGIN.top + plotH}
            className="stroke-border"
          />
          {/* y ticks */}
          {[0, 30, 60, 90, 120].map((svMl) => (
            <g key={svMl}>
              <line
                x1={MARGIN.left - 4}
                y1={y(svMl)}
                x2={MARGIN.left}
                y2={y(svMl)}
                className="stroke-border"
              />
              <text
                x={MARGIN.left - 8}
                y={y(svMl)}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-muted-foreground text-[10px]"
              >
                {svMl}
              </text>
            </g>
          ))}
          {/* x ticks */}
          {[50, 100, 150, 200, 250].map((edvMl) => (
            <g key={edvMl}>
              <line
                x1={x(edvMl)}
                y1={MARGIN.top + plotH}
                x2={x(edvMl)}
                y2={MARGIN.top + plotH + 4}
                className="stroke-border"
              />
              <text
                x={x(edvMl)}
                y={MARGIN.top + plotH + 16}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px]"
              >
                {edvMl}
              </text>
            </g>
          ))}
          {/* Axis labels */}
          <text
            x={MARGIN.left + plotW / 2}
            y={HEIGHT - 5}
            textAnchor="middle"
            className="fill-muted-foreground text-xs"
          >
            End-diastolic volume (mL)
          </text>
          <text
            x={-MARGIN.top - plotH / 2}
            y={16}
            transform="rotate(-90)"
            textAnchor="middle"
            className="fill-muted-foreground text-xs"
          >
            Stroke volume (mL)
          </text>

          {/* Reference normal curve — faint so the active curve pops */}
          {contractility !== "normal" ? (
            <path
              d={path(normalSamples)}
              className="stroke-muted-foreground/40 fill-none"
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
          ) : null}

          {/* Active curve */}
          <path d={path(activeSamples)} className="stroke-primary fill-none" strokeWidth={2.5} />

          {/* Current point */}
          <circle
            cx={x(edv)}
            cy={y(sv)}
            r={6}
            className="fill-primary stroke-background"
            strokeWidth={2}
          />
          <line
            x1={MARGIN.left}
            y1={y(sv)}
            x2={x(edv)}
            y2={y(sv)}
            strokeDasharray="3 3"
            className="stroke-muted-foreground/50"
          />
          <line
            x1={x(edv)}
            y1={y(sv)}
            x2={x(edv)}
            y2={MARGIN.top + plotH}
            strokeDasharray="3 3"
            className="stroke-muted-foreground/50"
          />
        </svg>

        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-muted-foreground text-xs tracking-widest uppercase">
              Stroke volume
            </dt>
            <dd className="text-2xl font-medium">{Math.round(sv)} mL</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs tracking-widest uppercase">
              Ejection fraction
            </dt>
            <dd className="text-2xl font-medium">{Math.round(ef)}%</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs tracking-widest uppercase">
              Classification
            </dt>
            <dd className="text-base font-medium">{efLabel}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs tracking-widest uppercase">
              Contractility
            </dt>
            <dd className="text-base font-medium capitalize">{contractility}</dd>
          </div>
        </dl>
      </div>

      <aside className="text-muted-foreground border-t pt-4 text-xs leading-6">
        <p>
          <span className="font-medium">Teaching note.</span> This is a Hill-shaped toy model tuned
          to look right, not to reproduce published ventricular pressure-volume data. The core
          lesson — that preload drives stroke volume along a saturating curve whose ceiling depends
          on contractility — is what the visual is for. Real patient curves vary widely in slope,
          threshold, and ceiling.
        </p>
      </aside>
    </div>
  );
}
