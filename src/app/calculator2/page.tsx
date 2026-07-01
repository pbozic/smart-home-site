"use client";

/**
 * DEV-ONLY custom-pricing calculator (v2).
 * Stripped from the static export by scripts/strip-dev-routes.mjs.
 * Available at http://localhost:3000/calculator2 during `pnpm dev`.
 *
 * Model
 * -----
 * Total price = device hardware  +  per-device installation  +  per-automation labour  +  electrician.
 *
 *  - Hardware: device catalog reused from the margin calculator. Each device has a
 *    separate STANDARD count and PREMIUM count (e.g. x premium bulbs + y standard bulbs).
 *  - Installation: a flat configurable rate charged per installed device.
 *  - Automations: each automation is scored by a weighted sum of its
 *    triggers / conditions / actions / entities (each type has a coefficient).
 *    If the score exceeds the "advanced threshold" it is billed as ADVANCED,
 *    otherwise BASIC. Each class has its own flat per-automation price.
 *  - Electrician: flat configurable cost.
 *
 * The computed total is compared against the configured tier (set) price.
 */

import { useState, useMemo, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

// ---------------------------------------------------------------------------
// Device catalog — same shape as the margin calculator
// ---------------------------------------------------------------------------

type DeviceId =
  | "bulb"
  | "light_relay"
  | "general_relay"
  | "roller_blind"
  | "venetian_blind"
  | "thermostat"
  | "smart_lock"
  | "video_doorbell"
  | "camera"
  | "sensor"
  | "smart_plug"
  | "rgbw_strip"
  | "rgbw_controller"
  | "voice_hub"
  | "ha_hub";

/**
 * Devices split into two installation-labour tiers:
 *  - "hard"  → wired into the electrical box (relays, blind motors) = more work
 *  - "basic" → plug-in / snap-in / paired (bulbs, sensors, plugs, cameras…)
 * The per-plan install rate for each tier is configurable (defaults 25 € / 10 €).
 */
type InstallTier = "hard" | "basic";

interface Device {
  id: DeviceId;
  name: string;
  note: string;
  stdPrice: number;
  premPrice: number;
  install: InstallTier;
}

// Prices are realistic 2026 EU single-unit retail (incl. VAT). Standard tier
// leans on Aqara; premium tier on Philips Hue / Nuki / Somfy-class brands.
const DEVICES: Device[] = [
  { id: "bulb",            name: "Pametna žarnica (E27)",   note: "std Aqara · prem Philips Hue",  stdPrice: 24,  premPrice: 45,  install: "basic" },
  { id: "light_relay",     name: "Luč — relay modul",       note: "za stikalno dozo, npr. Shelly", stdPrice: 16,  premPrice: 28,  install: "hard"  },
  { id: "general_relay",   name: "Splošni relej",           note: "suhi/mokri kontakt",            stdPrice: 38,  premPrice: 49,  install: "hard"  },
  { id: "roller_blind",    name: "Rolo senčilo — pogon",    note: "rolo/žaluzija, motor + krmilnik", stdPrice: 58,  premPrice: 120, install: "hard"  },
  { id: "venetian_blind",  name: "Beneško senčilo — pogon", note: "naklon + dvig, dražji pogon",   stdPrice: 130, premPrice: 320, install: "hard"  },
  { id: "thermostat",      name: "Termostat / TRV ventil",  note: "na radiator/cono",              stdPrice: 50,  premPrice: 95,  install: "basic" },
  { id: "smart_lock",      name: "Pametna ključavnica",     note: "std Aqara · prem Nuki",         stdPrice: 170, premPrice: 269, install: "basic" },
  { id: "video_doorbell",  name: "Video zvonec",            note: "",                              stdPrice: 100, premPrice: 190, install: "basic" },
  { id: "camera",          name: "Varnostna kamera",        note: "notranja/zunanja",              stdPrice: 100, premPrice: 185, install: "basic" },
  { id: "sensor",          name: "Senzor",                  note: "gibanje / okno / vrata",        stdPrice: 30,  premPrice: 50,  install: "basic" },
  { id: "smart_plug",      name: "Pametna vtičnica",        note: "",                              stdPrice: 25,  premPrice: 40,  install: "basic" },
  { id: "rgbw_strip",      name: "RGBW svetlobni trak",     note: "na meter",                      stdPrice: 28,  premPrice: 45,  install: "basic" },
  { id: "rgbw_controller", name: "Krmilnik LED traku",      note: "na trak/cono",                  stdPrice: 30,  premPrice: 45,  install: "basic" },
  { id: "voice_hub",       name: "Glasovni pomočnik",       note: "std HA Voice PE · prem Sonos",   stdPrice: 60,  premPrice: 195, install: "basic" },
  { id: "ha_hub",          name: "Home Assistant hub",      note: "mini PC",                       stdPrice: 350, premPrice: 500, install: "basic" },
];

// ---------------------------------------------------------------------------
// Automation model
// ---------------------------------------------------------------------------

interface Automation {
  id: string;
  name: string;
  triggers: number;
  conditions: number;
  actions: number;
  entities: number;
}

/** Weighted-sum coefficients + the score threshold that makes an automation "advanced". */
interface AutomationModel {
  coefTriggers: number;
  coefConditions: number;
  coefActions: number;
  coefEntities: number;
  advancedThreshold: number;
  priceBasic: number;
  priceAdvanced: number;
}

const DEFAULT_AUTOMATION_MODEL: AutomationModel = {
  coefTriggers: 1,
  coefConditions: 1.5,
  coefActions: 1,
  coefEntities: 0.5,
  advancedThreshold: 10,
  priceBasic: 40,
  priceAdvanced: 120,
};

function automationScore(a: Automation, m: AutomationModel): number {
  return (
    a.triggers * m.coefTriggers +
    a.conditions * m.coefConditions +
    a.actions * m.coefActions +
    a.entities * m.coefEntities
  );
}

function isAdvanced(a: Automation, m: AutomationModel): boolean {
  return automationScore(a, m) > m.advancedThreshold;
}

let uid = 0;
function newAutomation(name = "Avtomatizacija"): Automation {
  uid += 1;
  return { id: `a${uid}`, name, triggers: 1, conditions: 1, actions: 1, entities: 2 };
}

// ---------------------------------------------------------------------------
// Plan definitions
// ---------------------------------------------------------------------------

/** Per-device split into standard vs premium units. */
type DeviceSplit = Record<DeviceId, { std: number; prem: number }>;

interface PlanState {
  name: string;
  /** The configured "set" tier price we compare the computed total against. */
  tierPrice: number;
  devices: DeviceSplit;
  automations: Automation[];
  /** Install labour for a "hard" (wired) device, e.g. relays & blind motors. */
  installHard: number;
  /** Install labour for a "basic" (plug-in / paired) device. */
  installBasic: number;
  electricianCost: number;
  /** How many IT people the margin (set price − computed cost) is split across. */
  itSplits: number;
}

function emptySplit(): DeviceSplit {
  return DEVICES.reduce((acc, d) => {
    acc[d.id] = { std: 0, prem: 0 };
    return acc;
  }, {} as DeviceSplit);
}

function splitOf(overrides: Partial<Record<DeviceId, { std?: number; prem?: number }>>): DeviceSplit {
  const base = emptySplit();
  for (const [id, v] of Object.entries(overrides)) {
    base[id as DeviceId] = { std: v?.std ?? 0, prem: v?.prem ?? 0 };
  }
  return base;
}

const INITIAL_PLANS: PlanState[] = [
  {
    name: "Osnovni",
    tierPrice: 2500,
    devices: splitOf({ light_relay: { std: 3 }, roller_blind: { std: 2 }, bulb: { std: 4 }, ha_hub: { std: 1 } }),
    automations: [newAutomation("Prižgi luči ob mraku"), newAutomation("Spusti senčila")],
    installHard: 25,
    installBasic: 10,
    electricianCost: 400,
    itSplits: 2,
  },
  {
    name: "Napredni",
    tierPrice: 8000,
    devices: splitOf({
      light_relay: { std: 6, prem: 2 },
      bulb: { std: 4, prem: 2 },
      roller_blind: { std: 5 },
      general_relay: { std: 2 },
      thermostat: { std: 1 },
      smart_lock: { prem: 1 },
      video_doorbell: { std: 1 },
      camera: { std: 2 },
      sensor: { std: 4 },
      smart_plug: { std: 3 },
      voice_hub: { std: 1 },
      ha_hub: { std: 1 },
    }),
    automations: [
      newAutomation("Scenarij dobro jutro"),
      newAutomation("Odsotnost — varčevanje"),
      { ...newAutomation("Varnost — vlom"), triggers: 3, conditions: 4, actions: 5, entities: 8 },
    ],
    installHard: 25,
    installBasic: 10,
    electricianCost: 1200,
    itSplits: 2,
  },
  {
    name: "Premium",
    tierPrice: 15000,
    devices: splitOf({
      light_relay: { std: 8, prem: 12 },
      bulb: { prem: 10 },
      roller_blind: { prem: 8 },
      venetian_blind: { prem: 4 },
      general_relay: { std: 4 },
      thermostat: { prem: 3 },
      smart_lock: { prem: 2 },
      video_doorbell: { prem: 1 },
      camera: { prem: 4 },
      sensor: { std: 10 },
      smart_plug: { std: 6 },
      rgbw_strip: { prem: 15 },
      rgbw_controller: { prem: 3 },
      voice_hub: { prem: 3 },
      ha_hub: { prem: 1 },
    }),
    automations: [
      { ...newAutomation("Kino način"), triggers: 2, conditions: 3, actions: 6, entities: 10 },
      { ...newAutomation("Adaptivna razsvetljava"), triggers: 4, conditions: 5, actions: 6, entities: 14 },
      { ...newAutomation("Prisotnost + varnost"), triggers: 5, conditions: 6, actions: 8, entities: 18 },
      newAutomation("Zalivanje vrta"),
    ],
    installHard: 30,
    installBasic: 12,
    electricianCost: 2500,
    itSplits: 2,
  },
];

// ---------------------------------------------------------------------------
// Calculation
// ---------------------------------------------------------------------------

function calcPlan(plan: PlanState, model: AutomationModel) {
  let hardwareCost = 0;
  let deviceCount = 0;
  let hardCount = 0;
  let basicInstallCount = 0;
  for (const d of DEVICES) {
    const { std, prem } = plan.devices[d.id];
    const units = std + prem;
    hardwareCost += std * d.stdPrice + prem * d.premPrice;
    deviceCount += units;
    if (d.install === "hard") hardCount += units;
    else basicInstallCount += units;
  }

  // Two installation-labour tiers: wired ("hard") vs plug-in ("basic").
  const installHardCost = hardCount * plan.installHard;
  const installBasicCost = basicInstallCount * plan.installBasic;
  const installCost = installHardCost + installBasicCost;

  let automationCost = 0;
  let basicCount = 0;
  let advancedCount = 0;
  for (const a of plan.automations) {
    if (isAdvanced(a, model)) {
      advancedCount += 1;
      automationCost += model.priceAdvanced;
    } else {
      basicCount += 1;
      automationCost += model.priceBasic;
    }
  }

  const computedTotal = hardwareCost + installCost + automationCost + plan.electricianCost;
  const vsTier = plan.tierPrice - computedTotal; // + = tier price leaves margin over cost
  const vsTierPct = plan.tierPrice > 0 ? (vsTier / plan.tierPrice) * 100 : 0;

  // Margin left after covering the computed cost (electrician is already a cost
  // line, so it is not subtracted again). That margin is the IT team's share,
  // split across `itSplits` people.
  const margin = vsTier;
  const itShare = margin;
  const itPerPerson = plan.itSplits > 0 ? itShare / plan.itSplits : 0;

  return {
    hardwareCost,
    deviceCount,
    hardCount,
    basicInstallCount,
    installHardCost,
    installBasicCost,
    installCost,
    automationCost,
    basicCount,
    advancedCount,
    computedTotal,
    vsTier,
    vsTierPct,
    margin,
    itShare,
    itPerPerson,
  };
}

// ---------------------------------------------------------------------------
// Colours / formatting
// ---------------------------------------------------------------------------

const COLORS = {
  hardware:    "#f97316", // orange
  install:     "#a78bfa", // violet
  automation:  "#34d399", // green
  electrician: "#60a5fa", // blue
};

const PIE_COLORS = [COLORS.hardware, COLORS.install, COLORS.automation, COLORS.electrician];

// Deterministic formatting (identical on server & client) to avoid hydration
// mismatches — `toLocaleString` can differ between the Node ICU build and the
// browser, which breaks React hydration and, in turn, chart rendering.
function fmt(n: number) {
  const rounded = Math.round(n);
  const sign = rounded < 0 ? "-" : "";
  const digits = Math.abs(rounded).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${sign}${digits} €`;
}
function pct(n: number) {
  return n.toFixed(1).replace(".", ",") + " %";
}

// ---------------------------------------------------------------------------
// Small UI helpers
// ---------------------------------------------------------------------------

/**
 * Controlled numeric input that may be *temporarily empty* while editing.
 *
 * The problem it solves: with a plain `value={n}` + `onChange={parseFloat(v) || 0}`
 * you can never delete the last digit — clearing the box instantly snaps it back
 * to 0. Here we keep a local text draft so the field can be blank (or a partial
 * value like "1." / "-") while focused, and only report a number to the parent.
 *
 * `emptyValue` is what an empty field means numerically (e.g. 0 for counts, 1 for
 * "IT splits"). The draft is re-synced whenever the external value changes so
 * programmatic updates still show. On blur the draft is normalised to a number.
 */
interface NumberFieldProps {
  value: number;
  onChange: (v: number) => void;
  emptyValue?: number;
  min?: number;
  step?: number;
  className?: string;
}
function NumberField({ value, onChange, emptyValue = 0, min = 0, step, className = "" }: NumberFieldProps) {
  const [draft, setDraft] = useState<string>(String(value));

  // Keep the draft in sync when the external value changes for a reason other
  // than our own keystroke (e.g. reset, or a different field feeding this one).
  useEffect(() => {
    const parsed = draft.trim() === "" ? emptyValue : parseFloat(draft);
    if (!Number.isNaN(parsed) && parsed !== value) {
      setDraft(String(value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setDraft(raw);
    if (raw.trim() === "") {
      onChange(emptyValue); // empty → the neutral value, but the box stays blank
      return;
    }
    const n = parseFloat(raw);
    if (!Number.isNaN(n)) onChange(min != null ? Math.max(min, n) : n);
  }

  function handleBlur() {
    // Normalise the display once the user leaves the field.
    if (draft.trim() === "") {
      setDraft(String(emptyValue));
      onChange(emptyValue);
    } else {
      const n = parseFloat(draft);
      setDraft(String(Number.isNaN(n) ? emptyValue : Math.max(min ?? -Infinity, n)));
    }
  }

  return (
    <input
      type="number"
      inputMode="decimal"
      min={min}
      step={step}
      value={draft}
      onChange={handleChange}
      onBlur={handleBlur}
      className={`border border-white/20 bg-white/5 rounded text-white focus:outline-none focus:border-cyan-400 ${className}`}
    />
  );
}

/** Labelled numeric field built on NumberField (deletable / can be blank). */
function LabeledNum({
  label,
  value,
  onChange,
  emptyValue = 0,
  min = 0,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  emptyValue?: number;
  min?: number;
  step?: number;
}) {
  return (
    <label className="flex flex-col gap-0.5 text-xs text-white/60">
      {label}
      <NumberField
        value={value}
        onChange={onChange}
        emptyValue={emptyValue}
        min={min}
        step={step}
        className="px-2 py-1 text-sm"
      />
    </label>
  );
}

function Stat({ label, value, highlight, danger }: { label: string; value: string; highlight?: boolean; danger?: boolean }) {
  const cls = danger
    ? "bg-red-500/10 border border-red-400/30 text-red-300"
    : highlight
    ? "bg-cyan-500/10 border border-cyan-400/30 text-cyan-300"
    : "bg-white/5 text-white";
  return (
    <div className={`rounded p-2 ${cls}`}>
      <div className="text-xs text-white/50 mb-0.5">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function NumCell({ value, onChange, min = 0, step, emptyValue = 0 }: { value: number; onChange: (v: number) => void; min?: number; step?: number; emptyValue?: number }) {
  return (
    <NumberField
      value={value}
      onChange={onChange}
      emptyValue={emptyValue}
      min={min}
      step={step}
      className="w-14 px-1.5 py-0.5 text-sm text-center"
    />
  );
}

// ---------------------------------------------------------------------------
// Automation model editor (shared across plans)
// ---------------------------------------------------------------------------

function ModelEditor({ model, onChange }: { model: AutomationModel; onChange: (patch: Partial<AutomationModel>) => void }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/3 p-5 mb-10">
      <h3 className="text-base font-semibold mb-1">Model avtomatizacij</h3>
      <p className="text-white/50 text-xs mb-4">
        Utežena vsota{" "}
        <code className="text-white/60">
          sprožilci·{model.coefTriggers} + pogoji·{model.coefConditions} + akcije·{model.coefActions} + entitete·{model.coefEntities}
        </code>{" "}
        &gt; {model.advancedThreshold} → napredna avtomatizacija.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <LabeledNum label="Koef. sprožilcev" step={0.1} min={0} value={model.coefTriggers} onChange={v => onChange({ coefTriggers: v })} />
        <LabeledNum label="Koef. pogojev" step={0.1} min={0} value={model.coefConditions} onChange={v => onChange({ coefConditions: v })} />
        <LabeledNum label="Koef. akcij" step={0.1} min={0} value={model.coefActions} onChange={v => onChange({ coefActions: v })} />
        <LabeledNum label="Koef. entitet" step={0.1} min={0} value={model.coefEntities} onChange={v => onChange({ coefEntities: v })} />
        <LabeledNum label="Prag naprednosti" step={0.5} min={0} value={model.advancedThreshold} onChange={v => onChange({ advancedThreshold: v })} />
        <LabeledNum label="Cena osnovne (€)" min={0} value={model.priceBasic} onChange={v => onChange({ priceBasic: v })} />
        <LabeledNum label="Cena napredne (€)" min={0} value={model.priceAdvanced} onChange={v => onChange({ priceAdvanced: v })} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function Calculator2Page() {
  const [model, setModel] = useState<AutomationModel>(DEFAULT_AUTOMATION_MODEL);
  const [plans, setPlans] = useState<PlanState[]>(INITIAL_PLANS);

  function updatePlan(idx: number, patch: Partial<PlanState>) {
    setPlans(prev => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  }

  function setDeviceCount(planIdx: number, deviceId: DeviceId, tier: "std" | "prem", value: number) {
    setPlans(prev =>
      prev.map((p, i) =>
        i === planIdx
          ? {
              ...p,
              devices: {
                ...p.devices,
                [deviceId]: { ...p.devices[deviceId], [tier]: Math.max(0, value) },
              },
            }
          : p
      )
    );
  }

  function updateAutomation(planIdx: number, autoId: string, patch: Partial<Automation>) {
    setPlans(prev =>
      prev.map((p, i) =>
        i === planIdx
          ? { ...p, automations: p.automations.map(a => (a.id === autoId ? { ...a, ...patch } : a)) }
          : p
      )
    );
  }

  function addAutomation(planIdx: number) {
    setPlans(prev => prev.map((p, i) => (i === planIdx ? { ...p, automations: [...p.automations, newAutomation()] } : p)));
  }

  function removeAutomation(planIdx: number, autoId: string) {
    setPlans(prev =>
      prev.map((p, i) => (i === planIdx ? { ...p, automations: p.automations.filter(a => a.id !== autoId) } : p))
    );
  }

  const calcs = useMemo(() => plans.map(p => calcPlan(p, model)), [plans, model]);

  // Chart data — stacked cost breakdown per plan
  const stackData = plans.map((p, i) => {
    const c = calcs[i];
    return {
      name: p.name,
      "Naprave": Math.round(c.hardwareCost),
      "Montaža": Math.round(c.installCost),
      "Avtomatizacije": Math.round(c.automationCost),
      "Elektro": Math.round(p.electricianCost),
    };
  });

  // Computed total vs configured tier price
  const compareData = plans.map((p, i) => ({
    name: p.name,
    "Izračunan strošek": Math.round(calcs[i].computedTotal),
    "Cena paketa (set)": Math.round(p.tierPrice),
  }));

  return (
    <div className="min-h-screen bg-ink-950 text-white px-4 py-8">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <span className="text-xs font-medium text-cyan-400 uppercase tracking-widest">Dev only · v2</span>
          <h1 className="text-3xl font-bold mt-1">Kalkulator cen po meri</h1>
          <p className="text-white/50 text-sm mt-1">
            Sestavi ceno iz naprav (standardni Aqara / premium Philips Hue …), montaže po zahtevnosti
            (zahtevna za releje in senčila, osnovna za ostalo), avtomatizacij (osnovne/napredne) in elektro dela,
            ter jo primerjaj z nastavljeno ceno paketa.
          </p>
        </div>

        {/* Automation model editor */}
        <ModelEditor model={model} onChange={patch => setModel(m => ({ ...m, ...patch }))} />

        {/* Plan columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {plans.map((plan, pi) => {
            const calc = calcs[pi];
            return (
              <div key={plan.name} className="rounded-xl border border-white/10 bg-white/3 p-5 flex flex-col gap-4">
                {/* Plan header */}
                <div className="flex items-center justify-between gap-2">
                  <input
                    value={plan.name}
                    onChange={e => updatePlan(pi, { name: e.target.value })}
                    className="text-lg font-bold bg-transparent border-b border-transparent hover:border-white/20 focus:border-cyan-400 focus:outline-none w-full"
                  />
                </div>

                {/* Devices — std + premium split */}
                <div>
                  <div className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-wider mb-2">
                    <span className="flex-1">Naprave</span>
                    <span className="w-14 text-center">Std</span>
                    <span className="w-14 text-center text-purple-300">Prem</span>
                    <span className="w-16 text-right">Skupaj</span>
                  </div>
                  <div className="space-y-1">
                    {DEVICES.map(device => {
                      const { std, prem } = plan.devices[device.id];
                      const lineCost = std * device.stdPrice + prem * device.premPrice;
                      return (
                        <div key={device.id} className="flex items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-white">{device.name}</span>
                            <span
                              className={`ml-1.5 text-[10px] px-1 py-px rounded align-middle ${
                                device.install === "hard"
                                  ? "bg-amber-500/15 text-amber-300"
                                  : "bg-white/10 text-white/40"
                              }`}
                              title={device.install === "hard" ? "Zahtevna montaža (ožičenje)" : "Osnovna montaža (vklop/uparjanje)"}
                            >
                              {device.install === "hard" ? "zaht." : "osn."}
                            </span>
                            <div className="text-xs text-white/40">
                              {fmt(device.stdPrice)} / <span className="text-purple-300">{fmt(device.premPrice)}</span>
                              {device.note && <span className="ml-1">· {device.note}</span>}
                            </div>
                          </div>
                          <NumCell value={std} onChange={v => setDeviceCount(pi, device.id, "std", v)} />
                          <NumCell value={prem} onChange={v => setDeviceCount(pi, device.id, "prem", v)} />
                          <span className="text-xs text-orange-300 shrink-0 w-16 text-right">
                            {lineCost > 0 ? fmt(lineCost) : "—"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-xs text-white/40 mt-2">
                    {calc.deviceCount} naprav · strojna oprema {fmt(calc.hardwareCost)}
                  </div>
                </div>

                {/* Automations */}
                <div className="pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-wider mb-2">
                    <span className="flex-1">Avtomatizacije</span>
                    <span className="w-10 text-center" title="sprožilci">Spr</span>
                    <span className="w-10 text-center" title="pogoji">Pog</span>
                    <span className="w-10 text-center" title="akcije">Akc</span>
                    <span className="w-10 text-center" title="entitete">Ent</span>
                    <span className="w-16 text-right">Tip</span>
                    <span className="w-4" />
                  </div>
                  <div className="space-y-1.5">
                    {plan.automations.map(a => {
                      const adv = isAdvanced(a, model);
                      const score = automationScore(a, model);
                      return (
                        <div key={a.id} className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <input
                              value={a.name}
                              onChange={e => updateAutomation(pi, a.id, { name: e.target.value })}
                              className="flex-1 min-w-0 text-sm bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-white focus:outline-none focus:border-cyan-400"
                            />
                            <NumCell value={a.triggers} onChange={v => updateAutomation(pi, a.id, { triggers: v })} step={1} />
                            <NumCell value={a.conditions} onChange={v => updateAutomation(pi, a.id, { conditions: v })} step={1} />
                            <NumCell value={a.actions} onChange={v => updateAutomation(pi, a.id, { actions: v })} step={1} />
                            <NumCell value={a.entities} onChange={v => updateAutomation(pi, a.id, { entities: v })} step={1} />
                            <span
                              className={`w-16 text-right text-xs font-medium ${adv ? "text-green-300" : "text-white/60"}`}
                              title={`ocena ${score.toFixed(1)} / prag ${model.advancedThreshold}`}
                            >
                              {adv ? "Napredna" : "Osnovna"}
                            </span>
                            <button
                              onClick={() => removeAutomation(pi, a.id)}
                              className="w-4 text-white/30 hover:text-red-400 text-sm leading-none"
                              title="Odstrani"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => addAutomation(pi)}
                    className="mt-2 text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    + Dodaj avtomatizacijo
                  </button>
                  <div className="text-xs text-white/40 mt-2">
                    {calc.basicCount} osnovnih · {calc.advancedCount} naprednih · {fmt(calc.automationCost)}
                  </div>
                </div>

                {/* Financial inputs */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                  <LabeledNum
                    label="Montaža — zahtevna (€)"
                    min={0}
                    value={plan.installHard}
                    onChange={v => updatePlan(pi, { installHard: v })}
                  />
                  <LabeledNum
                    label="Montaža — osnovna (€)"
                    min={0}
                    value={plan.installBasic}
                    onChange={v => updatePlan(pi, { installBasic: v })}
                  />
                  <LabeledNum
                    label="Strošek elektroinštalaterja (€)"
                    min={0}
                    value={plan.electricianCost}
                    onChange={v => updatePlan(pi, { electricianCost: v })}
                  />
                  <LabeledNum
                    label="Cena paketa / set (€)"
                    min={0}
                    value={plan.tierPrice}
                    onChange={v => updatePlan(pi, { tierPrice: v })}
                  />
                  <LabeledNum
                    label="Število deležev IT ekipe"
                    min={1}
                    emptyValue={1}
                    value={plan.itSplits}
                    onChange={v => updatePlan(pi, { itSplits: Math.max(1, Math.round(v)) })}
                  />
                </div>

                {/* Results */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                  <Stat label="Naprave" value={fmt(calc.hardwareCost)} />
                  <Stat
                    label={`Montaža (${calc.hardCount}× zaht. + ${calc.basicInstallCount}× osn.)`}
                    value={fmt(calc.installCost)}
                  />
                  <Stat label="Avtomatizacije" value={fmt(calc.automationCost)} />
                  <Stat label="Elektro" value={fmt(plan.electricianCost)} />
                  <Stat label="Izračunan strošek" value={fmt(calc.computedTotal)} highlight />
                  <Stat
                    label="Razlika do cene paketa"
                    value={fmt(calc.vsTier)}
                    highlight={calc.vsTier >= 0}
                    danger={calc.vsTier < 0}
                  />
                  <Stat
                    label="IT delež (marža)"
                    value={fmt(calc.itShare)}
                    highlight={calc.itShare >= 0}
                    danger={calc.itShare < 0}
                  />
                  <Stat
                    label={`IT na osebo (÷${plan.itSplits})`}
                    value={fmt(calc.itPerPerson)}
                    highlight={calc.itPerPerson >= 0}
                    danger={calc.itPerPerson < 0}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-10">
          {/* Stacked bar — cost breakdown per plan */}
          <div className="rounded-xl border border-white/10 bg-white/3 p-5">
            <h3 className="text-base font-semibold mb-4">Razčlenitev izračunanega stroška</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stackData} margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 13 }} />
                <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k€`} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip
                  formatter={(value) => fmt(Number(value))}
                  contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                  labelStyle={{ color: "#fff" }}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
                <Bar dataKey="Naprave"        stackId="a" fill={COLORS.hardware} />
                <Bar dataKey="Montaža"        stackId="a" fill={COLORS.install} />
                <Bar dataKey="Avtomatizacije" stackId="a" fill={COLORS.automation} />
                <Bar dataKey="Elektro"        stackId="a" fill={COLORS.electrician} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Computed total vs configured tier price */}
          <div className="rounded-xl border border-white/10 bg-white/3 p-5">
            <h3 className="text-base font-semibold mb-4">Izračunan strošek vs. cena paketa</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={compareData} margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 13 }} />
                <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k€`} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip
                  formatter={(value) => fmt(Number(value))}
                  contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                  labelStyle={{ color: "#fff" }}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
                <Bar dataKey="Izračunan strošek" fill={COLORS.hardware} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Cena paketa (set)"  fill="#22d3ee" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie charts — cost split per plan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {plans.map((plan, pi) => {
            const c = calcs[pi];
            const pieData = [
              { name: "Naprave", value: c.hardwareCost },
              { name: "Montaža", value: c.installCost },
              { name: "Avtomatizacije", value: c.automationCost },
              { name: "Elektro", value: plan.electricianCost },
            ].filter(d => d.value > 0);

            return (
              <div key={plan.name} className="rounded-xl border border-white/10 bg-white/3 p-5">
                <h3 className="text-base font-semibold mb-4">{plan.name} — struktura stroška</h3>
                {c.computedTotal > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {pieData.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={
                              PIE_COLORS[
                                ["Naprave", "Montaža", "Avtomatizacije", "Elektro"].indexOf(entry.name)
                              ]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v) => fmt(Number(v))}
                        contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[220px] flex items-center justify-center text-sm text-white/40">
                    Ni podatkov
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary table */}
        <div className="rounded-xl border border-white/10 bg-white/3 p-5 overflow-x-auto">
          <h3 className="text-base font-semibold mb-4">Primerjava paketov</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 pr-4 text-white/50 font-normal"></th>
                {plans.map(p => (
                  <th key={p.name} className="text-right py-2 px-3 font-semibold text-white">{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { label: "Št. naprav",             vals: calcs.map(c => String(c.deviceCount)) },
                { label: "Strošek naprav",          vals: calcs.map(c => fmt(c.hardwareCost)) },
                { label: "Montaža — zahtevna",      vals: calcs.map(c => `${c.hardCount}× · ${fmt(c.installHardCost)}`) },
                { label: "Montaža — osnovna",       vals: calcs.map(c => `${c.basicInstallCount}× · ${fmt(c.installBasicCost)}`) },
                { label: "Montaža skupaj",          vals: calcs.map(c => fmt(c.installCost)) },
                { label: "Osnovne / napredne avt.", vals: calcs.map(c => `${c.basicCount} / ${c.advancedCount}`) },
                { label: "Strošek avtomatizacij",   vals: calcs.map(c => fmt(c.automationCost)) },
                { label: "Elektro",                 vals: plans.map(p => fmt(p.electricianCost)) },
                { label: "Izračunan strošek",       vals: calcs.map(c => fmt(c.computedTotal)) },
                { label: "Cena paketa (set)",       vals: plans.map(p => fmt(p.tierPrice)) },
                { label: "Razlika",                 vals: calcs.map(c => fmt(c.vsTier)) },
                { label: "Razlika %",               vals: calcs.map(c => pct(c.vsTierPct)) },
                { label: "IT delež (marža)",        vals: calcs.map(c => fmt(c.itShare)) },
                { label: "IT delež na osebo",       vals: calcs.map(c => fmt(c.itPerPerson)) },
              ].map(row => (
                <tr key={row.label}>
                  <td className="py-2 pr-4 text-white/50">{row.label}</td>
                  {row.vals.map((v, i) => (
                    <td key={i} className="py-2 px-3 text-right text-white tabular-nums">{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-8 text-xs text-white/30 text-center">
          Cene naprav so okvirne — posodobi jih v <code className="text-white/50">DEVICES</code>, model avtomatizacij pa v{" "}
          <code className="text-white/50">DEFAULT_AUTOMATION_MODEL</code> znotraj{" "}
          <code className="text-white/50">src/app/calculator2/page.tsx</code>.
        </p>
      </div>
    </div>
  );
}
