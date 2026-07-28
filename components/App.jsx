import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  Calendar, Trophy, Activity, Clock, LogOut, Plus, Check, X, ChevronLeft,
  ChevronRight, Flag, TrendingUp, Settings, Users, Home, Edit2, Trash2,
  ChevronDown, AlertCircle
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";

const C = {
  bg: "#12161B",
  surface: "#1A2029",
  surface2: "#222A33",
  border: "#2C3541",
  borderLight: "#39434F",
  text: "#F2F0EA",
  textDim: "#8B95A1",
  textFaint: "#5C6570",
  accent: "#C1440E",
  accentHover: "#DA5620",
  accentSoft: "#3A2318",
  success: "#8FBF3F",
  successSoft: "#25301A",
  warn: "#E0A72E",
  warnSoft: "#332A16",
  danger: "#D4483F",
  dangerSoft: "#331A18",
};

const FONT_DISPLAY = "'Oswald', sans-serif";
const FONT_BODY = "'Inter', sans-serif";
const FONT_MONO = "'JetBrains Mono', monospace";

const DISCIPLINES = [
  // sprint
  "60m", "100m", "150m", "200m", "300m", "400m",
  // middle distance
  "600m", "800m", "1000m", "1500m", "Míle", "2000m", "3000m",
  // long distance track
  "5000m", "10000m",
  // hurdles
  "60m překážky", "100m překážky", "110m překážky", "300m překážky", "400m překážky",
  // steeplechase
  "2000m překážky", "3000m překážky",
  // race walk
  "3000m chůze", "5000m chůze", "10000m chůze", "20km chůze", "35km chůze", "50km chůze",
  // road running
  "5km", "10km", "15km", "10 mil", "Půlmaraton", "25km", "30km", "Maraton", "100km",
  // relays
  "4x100m", "4x400m", "4x100m mix", "4x400m mix", "Švédská štafeta",
];

const FEELINGS = ["Vyčerpaný", "Těžké", "V pohodě", "Dobré", "Skvělé"];
const ABSENCE_REASONS = ["Nemoc", "Zranění", "Dovolená/cesta", "Škola/práce", "Jiné"];

const PERIOD_TYPES = [
  { key: "zaklad", label: "Základní příprava", color: "#4A7FBF" },
  { key: "rozvoj", label: "Rozvojové období", color: "#C1440E" },
  { key: "vrchol", label: "Vrcholové období", color: "#8FBF3F" },
  { key: "tapering", label: "Tapering", color: "#E0A72E" },
  { key: "prechod", label: "Přechodné období", color: "#8B95A1" },
];

const TRAINING_TYPES = ["Intervaly", "Tempo", "Fartlek", "Výběh", "Dlouhý běh", "Regenerace", "Rychlost", "Silový trénink", "Závod"];

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

// Common Czech first names -> correct vocative (5. pád) form.
// Covers the large majority of names in practice; anything missing falls
// back to a best-effort heuristic below, and can always be overridden
// manually per user in Nastavení.
const VOCATIVE_MAP = {
  jan: "Jene", petr: "Petře", pavel: "Pavle", tomáš: "Tomáši", jiří: "Jiří", josef: "Josefe",
  martin: "Martine", michal: "Michale", jakub: "Jakube", lukáš: "Lukáši", david: "Davide",
  filip: "Filipe", ondřej: "Ondřeji", adam: "Adame", marek: "Marku", vojtěch: "Vojtěchu",
  radek: "Radku", karel: "Karle", zdeněk: "Zdeňku", miroslav: "Miroslave", vladimír: "Vladimíre",
  františek: "Františku", roman: "Romane", daniel: "Danieli", aleš: "Aleši",
  milan: "Milane", robert: "Roberte", patrik: "Patriku", dominik: "Dominiku", matěj: "Matěji",
  šimon: "Šimone", vít: "Víte", stanislav: "Stanislave", antonín: "Antoníne", rostislav: "Rostislave",
  bohumil: "Bohumile", přemysl: "Přemysle", radim: "Radime", libor: "Libore", vlastimil: "Vlastimile",
  kryštof: "Kryštofe", erik: "Eriku", denis: "Denisi", marián: "Mariáne", ivan: "Ivane", igor: "Igore",
  hynek: "Hynku", bořek: "Bořku", jindřich: "Jindřichu", alois: "Aloisi", václav: "Václave",
  otakar: "Otakare", oldřich: "Oldřichu", jaroslav: "Jaroslave", vlastimír: "Vlastimíre",
  jana: "Jano", petra: "Petro", lucie: "Lucie", eva: "Evo", hana: "Hano", kateřina: "Kateřino",
  anna: "Anno", tereza: "Terezo", marie: "Marie", barbora: "Barboro", kristýna: "Kristýno",
  veronika: "Veroniko", michaela: "Michaelo", lenka: "Lenko", martina: "Martino", zuzana: "Zuzano",
  simona: "Simono", klára: "Kláro", andrea: "Andreo", monika: "Moniko", denisa: "Deniso",
  nikola: "Nikolo", adéla: "Adélo", karolína: "Karolíno", aneta: "Aneto", iva: "Ivo", alena: "Aleno",
  dagmar: "Dagmar", ivana: "Ivano", renata: "Renato", jitka: "Jitko", vendula: "Vendulo",
  šárka: "Šárko", radka: "Radko", pavla: "Pavlo", markéta: "Markéto", dominika: "Dominiko",
  natálie: "Natálie", viktorie: "Viktorie", gabriela: "Gabrielo", kamila: "Kamilo", helena: "Heleno",
  sabina: "Sabino", julie: "Julie", ella: "Ello", nela: "Nelo", diana: "Diano",
};

function guessVocative(firstName) {
  if (!firstName) return firstName;
  const key = firstName.toLowerCase();
  if (VOCATIVE_MAP[key]) {
    // preserve original capitalization style (first letter upper-case)
    return VOCATIVE_MAP[key];
  }
  // fallback heuristic for names not in the dictionary
  if (/[eěiyíoóu]$/i.test(firstName)) return firstName; // already vocative-like ending, leave unchanged
  if (/a$/i.test(firstName)) return firstName.slice(0, -1) + "o"; // most female names: -a -> -o
  if (/[kg]$/i.test(firstName)) return firstName + "u"; // hard ending -> -u
  if (/[šřčcžj]$/i.test(firstName)) return firstName + "i"; // soft ending -> -i
  return firstName + "e"; // most common male consonant ending -> -e
}

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function fmtDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" });
}

function fmtDateShort(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric" });
}

function daysUntil(dateStr) {
  const today = new Date(todayStr() + "T00:00:00");
  const target = new Date(dateStr + "T00:00:00");
  return Math.round((target - today) / 86400000);
}

function isRaceVisible(race, userId, isCoach) {
  if (isCoach) return true;
  const entries = race.entries || [];
  if (entries.length === 0) return true; // no specific entries = whole-team event
  return entries.some((e) => e.athleteId === userId);
}

// determine whether a discipline/segment label is 400m or shorter (seconds.hundredths format)
function stripDiacritics(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// comparison-only key: case, whitespace and diacritics insensitive, with "400 m" == "400m" == "400"
function disciplineKey(str) {
  let s = String(str || "").trim().toLowerCase();
  s = s.replace(/(\d+)\s+m\b/g, "$1m").replace(/(\d+)\s+km\b/g, "$1km");
  s = s.replace(/\s+/g, " ").trim();
  return stripDiacritics(s);
}

// normalize a free-typed discipline/segment label so equivalent notations
// ("400", "400 m", "400M") are treated as the exact same record, and snap it
// to the canonical spelling from DISCIPLINES when one matches
function normalizeDiscipline(input) {
  if (!input) return input;
  let s = String(input).trim();
  if (!s) return s;
  if (/^\d+$/.test(s)) s = s + "m"; // bare number -> assume meters
  s = s.replace(/(\d+)\s+m\b/gi, "$1m");
  s = s.replace(/(\d+)\s+km\b/gi, "$1km");
  s = s.replace(/(\d+)M\b/g, "$1m");
  s = s.replace(/(\d+)KM\b/g, "$1km");
  s = s.replace(/\s+/g, " ").trim();
  const key = disciplineKey(s);
  const canonical = DISCIPLINES.find((d) => disciplineKey(d) === key);
  return canonical || s;
}

function isShortDistance(label) {
  if (!label) return false;
  const s = String(label);
  if (/km\b/i.test(s)) return false;
  const match = s.match(/(\d+)\s*m\b/i);
  if (!match) return false;
  return Number(match[1]) <= 400;
}

// seconds -> "12.34" (<=400m) or "3:45.20" (>400m)
function fmtTime(totalSeconds, short) {
  if (totalSeconds === null || totalSeconds === undefined || isNaN(totalSeconds)) return short ? "--.--" : "--:--.--";
  if (short) return totalSeconds.toFixed(2);
  const m = Math.floor(totalSeconds / 60);
  const rem = totalSeconds - m * 60;
  const remStr = rem < 10 ? "0" + rem.toFixed(2) : rem.toFixed(2);
  return `${m}:${remStr}`;
}

// "3:45" or "1:02:15" or "225" -> seconds
function parseTime(str) {
  if (!str) return null;
  const clean = str.trim().replace(",", ".");
  if (!clean) return null;
  const parts = clean.split(":").map((p) => parseFloat(p));
  if (parts.some((p) => isNaN(p))) return null;
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return null;
}

// "75-80" or "3:15-3:20" or a plain single time -> { min, max } (max is null when no range given)
function parseTimeRange(str) {
  if (!str) return null;
  const clean = str.trim();
  if (!clean) return null;
  const dashParts = clean.split("-").map((p) => p.trim()).filter(Boolean);
  if (dashParts.length === 2) {
    const a = parseTime(dashParts[0]);
    const b = parseTime(dashParts[1]);
    if (a === null || b === null) return null;
    return { min: Math.min(a, b), max: Math.max(a, b) };
  }
  const single = parseTime(clean);
  if (single === null) return null;
  return { min: single, max: null };
}

// display target time for a segment, showing a range when one is set
function fmtTarget(seg) {
  const short = isShortDistance(seg.group || seg.label);
  if (seg.targetSeconds === null || seg.targetSeconds === undefined) return short ? "--.--" : "--:--.--";
  if (seg.targetMax) return `${fmtTime(seg.targetSeconds, short)}–${fmtTime(seg.targetMax, short)}`;
  return fmtTime(seg.targetSeconds, short);
}

// parse a shorthand like "4x400m + 3x300m" into individual segments, grouped so a
// shared target time (or range) can later be applied to every segment in the group at once
function parseSegmentPattern(str) {
  const parts = String(str).split(/[+,\n]/).map((p) => p.trim()).filter(Boolean);
  const segments = [];
  parts.forEach((part) => {
    const m = part.match(/^(\d+)\s*[x×]\s*(.+)$/i);
    if (m) {
      const count = parseInt(m[1], 10);
      const label = normalizeDiscipline(m[2].trim());
      for (let i = 1; i <= count && i <= 100; i++) {
        segments.push({ id: uid(), label: `${label} (${i}/${count})`, group: label, targetSeconds: null, targetMax: null });
      }
    } else {
      const label = normalizeDiscipline(part);
      segments.push({ id: uid(), label, group: label, targetSeconds: null, targetMax: null });
    }
  });
  return segments;
}

const emptyData = () => ({ users: [], trainings: [], results: [], races: [], pbs: [], raceResults: [], templates: [], wellness: [], goals: [], comments: [], absences: [], injuries: [], groups: [], periods: [] });

function migrate(data) {
  return {
    ...data,
    users: (data.users || []).map((u) => ({
      ...u,
      mainDisciplines: (u.mainDisciplines || (u.mainDiscipline ? [u.mainDiscipline] : [])).map(normalizeDiscipline),
    })),
    races: (data.races || []).map((r) => {
      const base = r.entries
        ? r
        : {
            ...r,
            entries:
              r.assignedTo && r.assignedTo.length > 0
                ? r.assignedTo.map((id) => ({ athleteId: id, disciplines: r.discipline ? [r.discipline] : [] }))
                : [],
          };
      return {
        ...base,
        entries: (base.entries || []).map((e) => ({ ...e, disciplines: (e.disciplines || []).map(normalizeDiscipline) })),
      };
    }),
    raceResults: (data.raceResults || []).map((rr) => ({
      ...rr,
      times: (rr.times || []).map((t) => ({ ...t, discipline: normalizeDiscipline(t.discipline) })),
    })),
    templates: data.templates || [],
    wellness: data.wellness || [],
    goals: (data.goals || []).map((g) => ({ ...g, discipline: normalizeDiscipline(g.discipline) })),
    comments: data.comments || [],
    absences: data.absences || [],
    injuries: data.injuries || [],
    groups: data.groups || [],
    periods: data.periods || [],
    pbs: (data.pbs || []).map((p) => ({ ...p, discipline: normalizeDiscipline(p.discipline) })),
    trainings: (data.trainings || []).map((t) => ({
      ...t,
      segments: (t.segments || []).map((s) => {
        const baseLabel = (s.group || s.label || "").replace(/\s*\(\d+\/\d+\)\s*$/, "");
        const norm = normalizeDiscipline(baseLabel);
        const suffixMatch = (s.label || "").match(/\(\d+\/\d+\)\s*$/);
        return { ...s, group: norm, label: suffixMatch ? `${norm} ${suffixMatch[0]}` : norm || s.label };
      }),
    })),
  };
}

async function loadData() {
  try {
    const { data: row, error } = await supabase.from("app_state").select("data").eq("id", "main").single();
    if (error) throw error;
    if (row && row.data && Object.keys(row.data).length > 0) return migrate(row.data);
    return emptyData();
  } catch (e) {
    console.error("Nepodařilo se načíst data ze Supabase", e);
    return emptyData();
  }
}

async function saveData(data) {
  try {
    const { error } = await supabase.from("app_state").upsert({ id: "main", data, updated_at: new Date().toISOString() });
    if (error) throw error;
  } catch (e) {
    console.error("Nepodařilo se uložit data do Supabase", e);
  }
}

function segmentPercent(seg, actualSeconds) {
  if (seg.targetMax) {
    if (actualSeconds <= seg.targetSeconds) return Math.min(130, (seg.targetSeconds / actualSeconds) * 100);
    if (actualSeconds >= seg.targetMax) return Math.max(0, (seg.targetMax / actualSeconds) * 100);
    return 100; // within the planned window
  }
  return Math.min(130, (seg.targetSeconds / actualSeconds) * 100);
}

function computePercent(training, result) {
  if (!training || !result) return null;
  const times = result.segmentTimes || [];
  let sum = 0, count = 0;
  for (const seg of training.segments || []) {
    const t = times.find((x) => x.segmentId === seg.id);
    if (t && t.seconds && seg.targetSeconds) {
      sum += segmentPercent(seg, t.seconds);
      count++;
    }
  }
  if (count === 0) return null;
  return Math.round(sum / count);
}

// session-RPE training load (Foster method): load = RPE (1-10) x duration in minutes
function sessionLoad(training, result) {
  if (!result || !result.rpe) return 0;
  const duration = training?.durationMinutes || 60; // sensible default when duration wasn't set
  return result.rpe * duration;
}

// aggregate an athlete's daily loads into ISO week buckets for the last `weeks` weeks
function weeklyLoads(data, athleteId, weeks = 12) {
  const results = data.results.filter((r) => r.athleteId === athleteId);
  const today = new Date(todayStr() + "T00:00:00");
  const buckets = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1 - i * 7); // Monday of that week
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const startStr = weekStart.toISOString().slice(0, 10);
    const endStr = weekEnd.toISOString().slice(0, 10);
    const load = results
      .filter((r) => r.date >= startStr && r.date <= endStr)
      .reduce((sum, r) => sum + sessionLoad(data.trainings.find((t) => t.id === r.trainingId), r), 0);
    buckets.push({ label: `${weekStart.getDate()}.${weekStart.getMonth() + 1}.`, load: Math.round(load) });
  }
  return buckets;
}

// simple acute (last 7 days) : chronic (last 28 days average) workload ratio, a common overload early-warning signal
function acuteChronicRatio(data, athleteId) {
  const today = new Date(todayStr() + "T00:00:00");
  const results = data.results.filter((r) => r.athleteId === athleteId);
  function loadSince(days) {
    const from = new Date(today);
    from.setDate(from.getDate() - days);
    const fromStr = from.toISOString().slice(0, 10);
    return results
      .filter((r) => r.date >= fromStr)
      .reduce((sum, r) => sum + sessionLoad(data.trainings.find((t) => t.id === r.trainingId), r), 0);
  }
  const acute = loadSince(7);
  const chronicWeekAvg = loadSince(28) / 4;
  if (chronicWeekAvg === 0) return null;
  return { acute, chronicWeekAvg, ratio: acute / chronicWeekAvg };
}

// checks a batch of {discipline, seconds} entries against existing pbs and returns
// the updated pbs list plus just the newly-set records (for celebration UI)
function detectNewPbs(existingPbs, athleteId, entries, type, date, note) {
  let pbs = existingPbs;
  const added = [];
  entries.forEach((e) => {
    if (!e.discipline || !e.seconds) return;
    const currentBest = pbs
      .filter((p) => p.athleteId === athleteId && p.discipline === e.discipline && p.type === type)
      .reduce((best, p) => (!best || p.seconds < best.seconds ? p : best), null);
    if (!currentBest || e.seconds < currentBest.seconds) {
      const entry = { id: uid(), athleteId, discipline: e.discipline, seconds: e.seconds, type, date, note };
      pbs = [...pbs, entry];
      added.push(entry);
    }
  });
  return { pbs, added };
}

// short auto-generated recap of the last 7 days, for the team (coach) or one athlete
function weeklySummary(data, athletes, athleteId) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const today = todayStr();

  const scopeResults = data.results.filter((r) => r.date >= cutoffStr && r.date <= today && (!athleteId || r.athleteId === athleteId));
  const scopeTrainings = data.trainings.filter((t) => t.date >= cutoffStr && t.date <= today && (!athleteId || t.assignedTo.includes(athleteId)));
  const assignedCount = athleteId
    ? scopeTrainings.length
    : scopeTrainings.reduce((sum, t) => sum + t.assignedTo.length, 0);
  const compliance = assignedCount ? Math.round((scopeResults.length / assignedCount) * 100) : null;
  const newPbs = data.pbs.filter((p) => p.date >= cutoffStr && p.date <= today && (!athleteId || p.athleteId === athleteId));
  const rpes = scopeResults.filter((r) => r.rpe).map((r) => r.rpe);
  const avgRpe = rpes.length ? (rpes.reduce((s, r) => s + r, 0) / rpes.length).toFixed(1) : null;
  const absences = data.absences.filter((a) => a.date >= cutoffStr && a.date <= today && (!athleteId || a.athleteId === athleteId));
  const activeInjuries = (data.injuries || []).filter((i) => (!i.endDate || i.endDate >= today) && (!athleteId || i.athleteId === athleteId));

  const parts = [];
  parts.push(`${scopeTrainings.length} ${scopeTrainings.length === 1 ? "trénink" : scopeTrainings.length < 5 ? "tréninky" : "tréninků"}`);
  if (compliance !== null) parts.push(`splněnost ${compliance}%`);
  if (newPbs.length) parts.push(`${newPbs.length} ${newPbs.length === 1 ? "nový rekord" : "nové rekordy"}`);
  if (avgRpe) parts.push(`průměrné RPE ${avgRpe}`);
  if (absences.length) parts.push(`${absences.length} ${absences.length === 1 ? "absence" : "absencí"}`);

  const narrative = `Tento týden proběhlo ${parts.join(", ")}.`;

  return { scopeTrainings, compliance, newPbs, avgRpe, absences, activeInjuries, narrative };
}

function percentColor(p) {
  if (p === null || p === undefined) return C.textFaint;
  if (p >= 95) return C.success;
  if (p >= 80) return C.warn;
  return C.danger;
}

// ---------- Shared UI bits ----------

function Btn({ children, onClick, variant = "default", style, type = "button", disabled }) {
  const base = {
    fontFamily: FONT_BODY,
    fontWeight: 600,
    fontSize: 14,
    padding: "9px 16px",
    borderRadius: 8,
    border: "1px solid " + C.border,
    background: C.surface2,
    color: C.text,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    transition: "background .15s, border-color .15s",
  };
  if (variant === "accent") {
    base.background = C.accent;
    base.borderColor = C.accent;
    base.color = "#FFF6F0";
  }
  if (variant === "ghost") {
    base.background = "transparent";
    base.border = "1px solid transparent";
  }
  if (variant === "danger") {
    base.color = C.danger;
    base.borderColor = C.dangerSoft;
  }
  return (
    <button type={type} disabled={disabled} onClick={onClick} style={{ ...base, ...style }}>
      {children}
    </button>
  );
}

function Card({ children, style }) {
  return (
    <div
      style={{
        background: C.surface,
        border: "1px solid " + C.border,
        borderRadius: 14,
        padding: "18px 20px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Badge({ children, color = C.textDim, bg = C.surface2 }) {
  return (
    <span
      style={{
        fontFamily: FONT_BODY,
        fontSize: 12,
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: 999,
        background: bg,
        color,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textDim, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  background: C.surface2,
  border: "1px solid " + C.border,
  borderRadius: 8,
  padding: "9px 12px",
  color: C.text,
  fontFamily: FONT_BODY,
  fontSize: 14,
  outline: "none",
};

function TextInput(props) {
  return <input {...props} style={{ ...inputStyle, ...(props.style || {}) }} />;
}
function Select(props) {
  return <select {...props} style={{ ...inputStyle, ...(props.style || {}) }} />;
}
function TextArea(props) {
  return <textarea {...props} style={{ ...inputStyle, resize: "vertical", minHeight: 70, ...(props.style || {}) }} />;
}

function SectionTitle({ icon: Icon, children, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {Icon && <Icon size={20} color={C.accent} />}
        <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 600, margin: 0, letterSpacing: 0.3 }}>{children}</h2>
      </div>
      {right}
    </div>
  );
}

function Empty({ text }) {
  return (
    <div style={{ padding: "28px 20px", textAlign: "center", color: C.textFaint, fontSize: 14, border: "1px dashed " + C.border, borderRadius: 12 }}>
      {text}
    </div>
  );
}

// ---------- Comments (coach <-> athlete, per training+athlete) ----------

function PbCelebration({ pbs, onDismiss }) {
  if (!pbs || pbs.length === 0) return null;
  return (
    <div style={{ marginTop: 10 }}>
      <style>{`
        @keyframes pbPopIn { 0% { transform: scale(0.7); opacity: 0; } 60% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); } }
        @keyframes pbGlow { 0%, 100% { box-shadow: 0 0 0 0 rgba(193,68,14,0.35); } 50% { box-shadow: 0 0 0 10px rgba(193,68,14,0); } }
        .pb-celebration-card { animation: pbPopIn 0.35s ease-out, pbGlow 1.8s ease-out 1; }
      `}</style>
      <div
        className="pb-celebration-card"
        style={{ background: C.accentSoft, border: "2px solid " + C.accent, borderRadius: 14, padding: "16px 18px", textAlign: "center" }}
      >
        <div style={{ fontSize: 28, marginBottom: 4 }}>🏆</div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 700, color: C.accent, marginBottom: 8 }}>
          {pbs.length > 1 ? "Nové osobní rekordy!" : "Nový osobní rekord!"}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 12 }}>
          {pbs.map((p) => (
            <div key={p.id} style={{ background: C.surface, borderRadius: 10, padding: "8px 12px" }}>
              <div style={{ fontSize: 12, color: C.textDim }}>{p.discipline} · {p.type === "race" ? "závod" : "trénink"}</div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 18, fontWeight: 700 }}>{fmtTime(p.seconds, isShortDistance(p.discipline))}</div>
            </div>
          ))}
        </div>
        <Btn variant="accent" onClick={onDismiss}>Paráda!</Btn>
      </div>
    </div>
  );
}

function CommentThread({ data, persist, trainingId, athleteId, currentUser }) {
  const [text, setText] = useState("");
  const thread = data.comments
    .filter((c) => c.trainingId === trainingId && c.athleteId === athleteId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  function send() {
    if (!text.trim()) return;
    const comment = {
      id: uid(),
      trainingId,
      athleteId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    persist((prev) => ({ ...prev, comments: [...prev.comments, comment] }));
    setText("");
  }

  return (
    <div style={{ marginTop: 10 }}>
      {thread.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
          {thread.map((c) => (
            <div key={c.id} style={{ background: c.authorRole === "coach" ? C.accentSoft : C.surface2, borderRadius: 8, padding: "6px 10px", fontSize: 12 }}>
              <span style={{ fontWeight: 600, color: c.authorRole === "coach" ? C.accent : C.text }}>{c.authorName}</span>
              <span style={{ color: C.textFaint }}> · {c.createdAt.slice(0, 10)}</span>
              <div style={{ marginTop: 2 }}>{c.text}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 6 }}>
        <TextInput
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Napsat poznámku…"
          style={{ flex: 1 }}
        />
        <Btn onClick={send}><Plus size={14} />Přidat</Btn>
      </div>
    </div>
  );
}

// ---------- App ----------

export default function App() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("dnes");
  const [loaded, setLoaded] = useState(false);
  const [authUser, setAuthUser] = useState(undefined); // undefined = still checking, null = logged out

  useEffect(() => {
    loadData().then((d) => {
      setData(d);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setAuthUser(session?.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function persist(updater) {
    setData((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveData(next);
      return next;
    });
  }

  if (!loaded || authUser === undefined) {
    return (
      <Wrap>
        <div style={{ color: C.textDim, fontFamily: FONT_BODY, padding: 40, textAlign: "center" }}>Načítám…</div>
      </Wrap>
    );
  }

  if (!authUser) {
    if (data.users.length === 0) {
      return (
        <Wrap>
          <FirstAccountSetup persist={persist} />
        </Wrap>
      );
    }
    return (
      <Wrap>
        <PasswordLogin />
      </Wrap>
    );
  }

  const currentUser = data.users.find((u) => u.email && u.email.toLowerCase() === authUser.email.toLowerCase());

  if (!currentUser) {
    return (
      <Wrap>
        <NoProfileScreen email={authUser.email} />
      </Wrap>
    );
  }

  const athletes = data.users.filter((u) => u.role === "athlete");
  const isCoach = currentUser.role === "coach";

  const tabs = isCoach
    ? [
        { id: "dnes", label: "Přehled", icon: Home },
        { id: "kalendar", label: "Kalendář", icon: Calendar },
        { id: "treninky", label: "Tréninky", icon: Activity },
        { id: "zavody", label: "Závody", icon: Flag },
        { id: "atleti", label: "Atleti", icon: Users },
        { id: "nastaveni", label: "Nastavení", icon: Settings },
      ]
    : [
        { id: "dnes", label: "Dnes", icon: Home },
        { id: "kalendar", label: "Kalendář", icon: Calendar },
        { id: "treninky", label: "Tréninky", icon: Activity },
        { id: "zavody", label: "Závody", icon: Flag },
        { id: "karta", label: "Moje karta", icon: Trophy },
      ];

  return (
    <Wrap>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: C.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid " + C.accent }}>
            <Activity size={20} color={C.accent} />
          </div>
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 600, letterSpacing: 0.5 }}>TRÉNINKOVÝ DENÍK</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{currentUser.name}</div>
            <div style={{ fontSize: 11, color: C.textFaint }}>{isCoach ? "Trenér" : (currentUser.mainDisciplines || []).join(", ") || "Atlet"}</div>
          </div>
          <Btn variant="ghost" onClick={() => supabase.auth.signOut()}>
            <LogOut size={16} />
          </Btn>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 24, borderBottom: "1px solid " + C.border, overflowX: "auto" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              fontFamily: FONT_BODY,
              fontWeight: 600,
              fontSize: 13,
              padding: "10px 14px",
              background: "transparent",
              border: "none",
              borderBottom: tab === t.id ? "2px solid " + C.accent : "2px solid transparent",
              color: tab === t.id ? C.text : C.textDim,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 7,
              whiteSpace: "nowrap",
            }}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "dnes" && (isCoach ? <CoachToday data={data} persist={persist} setTab={setTab} currentUser={currentUser} /> : <AthleteToday data={data} persist={persist} athlete={currentUser} />)}
      {tab === "kalendar" && <CalendarView data={data} currentUser={currentUser} />}
      {tab === "treninky" && <Treninky data={data} persist={persist} currentUser={currentUser} isCoach={isCoach} athletes={athletes} />}
      {tab === "zavody" && <Zavody data={data} persist={persist} isCoach={isCoach} athletes={athletes} currentUser={currentUser} />}
      {tab === "karta" && <AthleteCard data={data} persist={persist} athlete={currentUser} canEdit={true} />}
      {tab === "atleti" && <AtletiList data={data} persist={persist} athletes={athletes} />}
      {tab === "nastaveni" && <Nastaveni data={data} persist={persist} currentUser={currentUser} />}
    </Wrap>
  );
}

function Wrap({ children }) {
  return (
    <div style={{ background: "transparent", minHeight: 10 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');
        * { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: ${C.textFaint}; }
        select option { background: ${C.surface2}; }
      `}</style>
      <div
        style={{
          background: C.bg,
          color: C.text,
          fontFamily: FONT_BODY,
          borderRadius: 16,
          padding: "22px 22px 32px",
          maxWidth: 980,
          margin: "0 auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ---------- Login ----------

function PasswordLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function login() {
    if (!email.trim() || !password) {
      setError("Zadej e-mail i heslo.");
      return;
    }
    setSending(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setSending(false);
    if (err) {
      setError("Nesprávný e-mail nebo heslo.");
    }
  }

  async function forgotPassword() {
    if (!email.trim()) {
      setError("Nejdřív napiš svůj e-mail nahoru, pak klikni na odkaz znovu.");
      return;
    }
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
    });
    setResetSent(true);
  }

  return (
    <div style={{ maxWidth: 380, margin: "60px auto" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 30, fontWeight: 700, letterSpacing: 1 }}>TRÉNINKOVÝ DENÍK</div>
        <div style={{ color: C.textDim, fontSize: 13, marginTop: 4 }}>Přihlas se e-mailem a heslem, které ti dal trenér.</div>
      </div>
      <Card>
        <Field label="E-mail">
          <TextInput autoFocus type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jmeno@email.cz" />
        </Field>
        <Field label="Heslo">
          <TextInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="••••••••"
          />
        </Field>
        {error && <div style={{ color: C.danger, fontSize: 13, marginBottom: 12 }}>{error}</div>}
        {resetSent && <div style={{ color: C.success, fontSize: 13, marginBottom: 12 }}>Poslali jsme ti e-mail na obnovení hesla.</div>}
        <Btn variant="accent" style={{ width: "100%", justifyContent: "center", marginBottom: 10 }} onClick={login} disabled={sending}>
          {sending ? "Přihlašuji…" : "Přihlásit se"}
        </Btn>
        <button onClick={forgotPassword} style={{ background: "transparent", border: "none", color: C.textFaint, fontSize: 12, cursor: "pointer", width: "100%", textAlign: "center" }}>
          Zapomenuté heslo?
        </button>
      </Card>
    </div>
  );
}

function FirstAccountSetup({ persist }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function createFirstCoach() {
    if (!name.trim() || !email.trim() || password.length < 8) {
      setError("Vyplň jméno, e-mail a heslo (alespoň 8 znaků).");
      return;
    }
    setSending(true);
    setError("");
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email: email.trim(), password });
    setSending(false);
    if (signUpError) {
      setError(signUpError.message || "Účet se nepodařilo založit.");
      return;
    }
    if (!signUpData.session) {
      setError("Účet je založený, ale je potřeba potvrdit e-mail — zkontroluj schránku a pak se přihlas heslem.");
      return;
    }
    const coach = { id: uid(), name: name.trim(), role: "coach", email: email.trim().toLowerCase(), mainDisciplines: [] };
    await persist((prev) => ({ ...prev, users: [...prev.users, coach] }));
  }

  return (
    <div style={{ maxWidth: 380, margin: "60px auto" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 30, fontWeight: 700, letterSpacing: 1 }}>TRÉNINKOVÝ DENÍK</div>
        <div style={{ color: C.textDim, fontSize: 13, marginTop: 4 }}>Vítej. Jsi první, kdo appku otevřel — založ si trenérský účet.</div>
      </div>
      <Card>
        <Field label="Jméno trenéra">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Jan Novák" />
        </Field>
        <Field label="E-mail">
          <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jan@email.cz" />
        </Field>
        <Field label="Heslo (alespoň 8 znaků)">
          <TextInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </Field>
        {error && <div style={{ color: C.danger, fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <Btn variant="accent" style={{ width: "100%", justifyContent: "center" }} onClick={createFirstCoach} disabled={sending}>
          {sending ? "Vytvářím…" : "Vytvořit účet trenéra"}
        </Btn>
      </Card>
    </div>
  );
}

function NoProfileScreen({ email }) {
  return (
    <div style={{ maxWidth: 380, margin: "60px auto", textAlign: "center" }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 600, marginBottom: 10 }}>Účet zatím nemáš založený</div>
      <div style={{ color: C.textDim, fontSize: 14, marginBottom: 16 }}>
        Tvůj e-mail <strong style={{ color: C.text }}>{email}</strong> zatím není přiřazen k žádnému účtu. Popros trenéra, ať ti v Nastavení založí přístup.
      </div>
      <Btn onClick={() => supabase.auth.signOut()}>Odhlásit se</Btn>
    </div>
  );
}

// ---------- Athlete Today ----------

function bestPb(pbs, athleteId, discipline, type) {
  const items = pbs.filter((p) => p.athleteId === athleteId && p.discipline === discipline && p.type === type);
  if (!items.length) return null;
  return items.reduce((best, p) => (p.seconds < best.seconds ? p : best));
}

function PbQuickView({ data, athlete }) {
  const pbs = data.pbs.filter((p) => p.athleteId === athlete.id);
  const own = athlete.mainDisciplines || [];
  const others = [...new Set(pbs.map((p) => p.discipline))].filter((d) => !own.includes(d));
  const disciplines = [...own, ...others];

  if (disciplines.length === 0) return null;

  return (
    <Card style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, color: C.textFaint, marginBottom: 10 }}>Osobní a tréninkové rekordy</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px,1fr))", gap: 10 }}>
        {disciplines.map((d) => {
          const race = bestPb(data.pbs, athlete.id, d, "race");
          const training = bestPb(data.pbs, athlete.id, d, "training");
          if (!race && !training) return null;
          return (
            <div key={d} style={{ background: C.surface2, borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 11, color: C.textDim, marginBottom: 4 }}>{d}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 10, color: C.textFaint }}>závod</span>
                <span style={{ fontFamily: FONT_MONO, fontSize: 15, fontWeight: 600, color: race ? C.text : C.textFaint }}>{race ? fmtTime(race.seconds, isShortDistance(d)) : "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 10, color: C.textFaint }}>trénink</span>
                <span style={{ fontFamily: FONT_MONO, fontSize: 15, fontWeight: 600, color: training ? C.text : C.textFaint }}>{training ? fmtTime(training.seconds, isShortDistance(d)) : "—"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

const WELLNESS_SCALES = [
  { key: "sleep", label: "Spánek", low: "Špatný", high: "Skvělý" },
  { key: "soreness", label: "Svalová bolest", low: "Silná", high: "Žádná" },
  { key: "mood", label: "Nálada", low: "Špatná", high: "Skvělá" },
];

function WellnessCheckin({ data, persist, athlete }) {
  const today = todayStr();
  const existing = data.wellness.find((w) => w.athleteId === athlete.id && w.date === today);
  const [editing, setEditing] = useState(!existing);
  const [sleep, setSleep] = useState(existing?.sleep || 3);
  const [soreness, setSoreness] = useState(existing?.soreness || 3);
  const [mood, setMood] = useState(existing?.mood || 3);

  function save() {
    const entry = { id: existing?.id || uid(), athleteId: athlete.id, date: today, sleep: Number(sleep), soreness: Number(soreness), mood: Number(mood) };
    persist((prev) => ({
      ...prev,
      wellness: existing ? prev.wellness.map((w) => (w.id === existing.id ? entry : w)) : [...prev.wellness, entry],
    }));
    setEditing(false);
  }

  return (
    <Card style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: editing ? 12 : 0 }}>
        <div style={{ fontSize: 12, color: C.textFaint }}>Jak se dnes cítíš?</div>
        {!editing && <Btn variant="ghost" onClick={() => setEditing(true)}><Edit2 size={13} /></Btn>}
      </div>
      {!editing ? (
        <div style={{ display: "flex", gap: 16, fontSize: 13 }}>
          <span>😴 {existing.sleep}/5</span>
          <span>💪 {existing.soreness}/5</span>
          <span>🙂 {existing.mood}/5</span>
        </div>
      ) : (
        <div>
          {WELLNESS_SCALES.map(({ key, label, low, high }) => {
            const val = key === "sleep" ? sleep : key === "soreness" ? soreness : mood;
            const setVal = key === "sleep" ? setSleep : key === "soreness" ? setSoreness : setMood;
            return (
              <div key={key} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.textDim, marginBottom: 4 }}>
                  <span>{label}</span>
                  <span>{val}/5</span>
                </div>
                <input type="range" min={1} max={5} value={val} onChange={(e) => setVal(e.target.value)} style={{ width: "100%" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.textFaint }}>
                  <span>{low}</span>
                  <span>{high}</span>
                </div>
              </div>
            );
          })}
          <Btn variant="accent" onClick={save}><Check size={14} />Uložit</Btn>
        </div>
      )}
    </Card>
  );
}

function CollapsibleSection({ title, icon: Icon, defaultOpen = false, badge, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 12 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: C.surface,
          border: "1px solid " + C.border,
          borderRadius: 12,
          padding: "10px 14px",
          cursor: "pointer",
          color: C.text,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600 }}>
          {Icon && <Icon size={16} color={C.accent} />}
          {title}
          {badge}
        </span>
        <ChevronDown size={16} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s", color: C.textFaint }} />
      </button>
      {open && <div style={{ marginTop: 8 }}>{children}</div>}
    </div>
  );
}

function AthleteToday({ data, persist, athlete }) {
  const today = todayStr();
  const todays = data.trainings.filter((t) => t.date === today && t.assignedTo.includes(athlete.id));
  const upcoming = data.trainings
    .filter((t) => t.date > today && t.assignedTo.includes(athlete.id))
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const nextRace = data.races
    .filter((r) => r.date >= today && isRaceVisible(r, athlete.id, false))
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const checkedInToday = data.wellness.some((w) => w.athleteId === athlete.id && w.date === today);

  return (
    <div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 600, marginBottom: 2 }}>Ahojda {athlete.vocative || guessVocative(athlete.name.split(" ")[0])},</div>
      <SectionTitle icon={Home}>Dnes — {fmtDate(today)}</SectionTitle>

      {nextRace && (
        <Card style={{ marginBottom: 16, borderColor: nextRace.goal ? C.accent : C.border, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 12, color: C.textDim, marginBottom: 3 }}>{nextRace.goal ? "Cílový závod" : "Nejbližší závod"}</div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>
              {nextRace.name}
              {(() => {
                const mine = (nextRace.entries || []).find((e) => e.athleteId === athlete.id);
                const disc = mine ? mine.disciplines.join(", ") : [...new Set((nextRace.entries || []).flatMap((e) => e.disciplines))].join(", ");
                return disc ? ` · ${disc}` : "";
              })()}
            </div>
          </div>
          <Badge bg={C.accentSoft} color={C.accent}>za {daysUntil(nextRace.date)} dní</Badge>
        </Card>
      )}

      {todays.length === 0 && (
        <Empty
          text={
            upcoming
              ? `Dnes nemáš naplánovaný trénink. Nejbližší je ${fmtDate(upcoming.date)} (${upcoming.title || upcoming.type}).`
              : "Dnes nemáš naplánovaný trénink."
          }
        />
      )}

      {todays.map((t) => (
        <TrainingCard key={t.id} training={t} data={data} persist={persist} athlete={athlete} highlight />
      ))}

      <CollapsibleSection title="Jak se dnes cítíš?" icon={Activity} defaultOpen={!checkedInToday} badge={checkedInToday && <Badge bg={C.successSoft} color={C.success}>hotovo</Badge>}>
        <WellnessCheckin data={data} persist={persist} athlete={athlete} />
      </CollapsibleSection>

      <CollapsibleSection title="Týdenní souhrn" icon={TrendingUp}>
        <WeeklySummaryCard data={data} athleteId={athlete.id} />
      </CollapsibleSection>

      <CollapsibleSection title="Osobní rekordy" icon={Trophy}>
        <PbQuickView data={data} athlete={athlete} />
      </CollapsibleSection>

      <CollapsibleSection title="Tento týden" icon={Calendar}>
        <WeekOverview data={data} athlete={athlete} />
      </CollapsibleSection>
    </div>
  );
}

function WeeklySummaryCard({ data, athleteId }) {
  const summary = weeklySummary(data, null, athleteId);
  return (
    <Card style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, color: C.textFaint, marginBottom: 8 }}>Tvůj týdenní souhrn</div>
      <div style={{ fontSize: 14 }}>{summary.narrative}</div>
    </Card>
  );
}

function WeekOverview({ data, athlete }) {
  const today = new Date(todayStr() + "T00:00:00");
  const monday = new Date(today);
  monday.setDate(monday.getDate() - ((today.getDay() + 6) % 7));
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    days.push(d.toISOString().slice(0, 10));
  }
  const todayStr_ = todayStr();
  const dayNames = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];

  return (
    <Card style={{ marginTop: 8 }}>
      <div style={{ fontSize: 12, color: C.textFaint, marginBottom: 10 }}>Tento týden</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {days.map((dateStr, i) => {
          const trainings = data.trainings.filter((t) => t.date === dateStr && t.assignedTo.includes(athlete.id));
          const races = data.races.filter((r) => r.date === dateStr && isRaceVisible(r, athlete.id, false));
          const isToday = dateStr === todayStr_;
          const hasSomething = trainings.length > 0 || races.length > 0;
          return (
            <div
              key={dateStr}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                padding: "6px 8px",
                borderRadius: 8,
                background: isToday ? C.accentSoft : "transparent",
              }}
            >
              <div style={{ width: 60, flexShrink: 0, fontSize: 12, color: isToday ? C.accent : C.textFaint, fontWeight: isToday ? 700 : 400 }}>
                {dayNames[i]} {fmtDateShort(dateStr)}
              </div>
              <div style={{ flex: 1, fontSize: 13 }}>
                {!hasSomething && <span style={{ color: C.textFaint }}>—</span>}
                {trainings.map((t) => (
                  <div key={t.id} style={{ color: C.text }}>
                    <Badge bg={C.surface2} color={C.textDim}>{t.type}</Badge> {t.title || t.type}
                  </div>
                ))}
                {races.map((r) => (
                  <div key={r.id} style={{ color: C.accent }}>
                    <Badge bg={C.accentSoft} color={C.accent}>závod</Badge> {r.name}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function TrainingCard({ training, data, persist, athlete, highlight }) {
  const [open, setOpen] = useState(false);
  const [showAbsence, setShowAbsence] = useState(false);
  const result = data.results.find((r) => r.trainingId === training.id && r.athleteId === athlete.id);
  const percent = result ? computePercent(training, result) : null;
  const absence = data.absences.find((a) => a.athleteId === athlete.id && a.date === training.date);

  function reportAbsence(reason, note) {
    persist((prev) => ({
      ...prev,
      absences: [...prev.absences.filter((a) => !(a.athleteId === athlete.id && a.date === training.date)), { id: uid(), athleteId: athlete.id, date: training.date, reason, note }],
    }));
    setShowAbsence(false);
  }
  function clearAbsence() {
    persist((prev) => ({ ...prev, absences: prev.absences.filter((a) => !(a.athleteId === athlete.id && a.date === training.date)) }));
  }

  return (
    <Card style={{ marginBottom: 14, borderColor: highlight ? C.accent : C.border }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
            <Badge bg={C.surface2} color={C.textDim}>{training.type}</Badge>
            {training.time && <span style={{ fontSize: 12, color: C.textFaint, display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} />{training.time}</span>}
            {training.location && <span style={{ fontSize: 12, color: C.textFaint }}>· {training.location}</span>}
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 600 }}>{training.title || training.type}</div>
          {training.description && <div style={{ fontSize: 13, color: C.textDim, marginTop: 4, maxWidth: 520 }}>{training.description}</div>}
        </div>
        <div style={{ textAlign: "right" }}>
          {absence ? (
            <Badge bg={C.dangerSoft} color={C.danger}>{absence.reason}</Badge>
          ) : result ? (
            <Badge bg="transparent" color={percentColor(percent)}>
              <span style={{ fontFamily: FONT_MONO, fontSize: 15 }}>{percent === null ? "zapsáno" : `${percent}%`}</span>
            </Badge>
          ) : (
            <Badge bg={C.surface2} color={C.textFaint}>nezapsáno</Badge>
          )}
        </div>
      </div>

      {result && result.freeRun && (
        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
          <div style={{ background: C.surface2, borderRadius: 8, padding: "6px 10px", fontSize: 12 }}>
            <span style={{ color: C.textDim }}>Vzdálenost</span>{" "}
            <span style={{ fontFamily: FONT_MONO, color: C.text }}>{result.freeRun.km} km</span>
          </div>
          <div style={{ background: C.surface2, borderRadius: 8, padding: "6px 10px", fontSize: 12 }}>
            <span style={{ color: C.textDim }}>Tempo</span>{" "}
            <span style={{ fontFamily: FONT_MONO, color: C.text }}>{fmtTime(result.freeRun.paceSeconds)} /km</span>
          </div>
          <div style={{ background: C.surface2, borderRadius: 8, padding: "6px 10px", fontSize: 12 }}>
            <span style={{ color: C.textDim }}>Celkem</span>{" "}
            <span style={{ fontFamily: FONT_MONO, color: C.text }}>{fmtTime(result.freeRun.totalSeconds)}</span>
          </div>
        </div>
      )}

      {training.segments && training.segments.length > 0 && (
        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {training.segments.map((s) => {
            const t = result && result.segmentTimes.find((x) => x.segmentId === s.id);
            return (
              <div key={s.id} style={{ background: C.surface2, borderRadius: 8, padding: "6px 10px", fontSize: 12 }}>
                <span style={{ color: C.textDim }}>{s.label}</span>
                <span style={{ color: C.textFaint }}> cíl {fmtTarget(s)}</span>
                {t && <span style={{ fontFamily: FONT_MONO, color: C.text, marginLeft: 6 }}>→ {fmtTime(t.seconds, isShortDistance(s.group || s.label))}</span>}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {!absence && !open && (
          <Btn variant={result ? "default" : "accent"} onClick={() => setOpen(true)}>
            <Plus size={15} />
            {result ? "Upravit zápis" : "Zapsat výsledek"}
          </Btn>
        )}
        {!absence && !open && (
          <Btn variant="ghost" onClick={() => setShowAbsence(true)}>Nemůžu přijít</Btn>
        )}
        {absence && (
          <Btn variant="ghost" onClick={clearAbsence}><X size={14} />Zrušit nahlášenou absenci</Btn>
        )}
      </div>

      {showAbsence && <AbsenceForm onCancel={() => setShowAbsence(false)} onSave={reportAbsence} />}

      {open && <ResultForm training={training} athlete={athlete} existing={result} data={data} persist={persist} onClose={() => setOpen(false)} />}

      <CommentThread data={data} persist={persist} trainingId={training.id} athleteId={athlete.id} currentUser={athlete} />
    </Card>
  );
}

function AbsenceForm({ onCancel, onSave }) {
  const [reason, setReason] = useState(ABSENCE_REASONS[0]);
  const [note, setNote] = useState("");
  return (
    <div style={{ background: C.surface2, borderRadius: 10, padding: 14, marginTop: 10 }}>
      <Field label="Důvod">
        <Select value={reason} onChange={(e) => setReason(e.target.value)}>
          {ABSENCE_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </Select>
      </Field>
      <Field label="Poznámka (volitelné)"><TextInput value={note} onChange={(e) => setNote(e.target.value)} placeholder="volitelné" /></Field>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn onClick={onCancel}>Zrušit</Btn>
        <Btn variant="accent" onClick={() => onSave(reason, note)}><Check size={14} />Nahlásit</Btn>
      </div>
    </div>
  );
}

function ResultForm({ training, athlete, existing, data, persist, onClose }) {
  const [times, setTimes] = useState(() => {
    const map = {};
    (existing?.segmentTimes || []).forEach((t) => {
      const seg = (training.segments || []).find((s) => s.id === t.segmentId);
      map[t.segmentId] = fmtTime(t.seconds, isShortDistance(seg?.group || seg?.label));
    });
    return map;
  });
  const [rpe, setRpe] = useState(existing?.rpe ?? 6);
  const [feeling, setFeeling] = useState(existing?.feeling ?? 3);
  const [note, setNote] = useState(existing?.note ?? "");
  const [celebration, setCelebration] = useState(null);
  const isFreeRun = training.type === "Výběh";
  const [freeKm, setFreeKm] = useState(existing?.freeRun?.km ? String(existing.freeRun.km) : "");
  const [freePace, setFreePace] = useState(existing?.freeRun?.paceSeconds ? fmtTime(existing.freeRun.paceSeconds) : "");

  function submit() {
    const segmentTimes = (training.segments || [])
      .map((s) => ({ segmentId: s.id, seconds: parseTime(times[s.id]) }))
      .filter((t) => t.seconds !== null);
    const km = parseFloat(String(freeKm).replace(",", "."));
    const paceSeconds = parseTime(freePace);
    const freeRun = isFreeRun && km > 0 && paceSeconds ? { km, paceSeconds, totalSeconds: km * paceSeconds } : null;
    const result = {
      id: existing?.id || uid(),
      trainingId: training.id,
      athleteId: athlete.id,
      date: todayStr(),
      segmentTimes,
      freeRun,
      rpe: Number(rpe),
      feeling: Number(feeling),
      note,
    };
    const disciplineEntries = segmentTimes.map((st) => {
      const seg = (training.segments || []).find((s) => s.id === st.segmentId);
      return { discipline: normalizeDiscipline(seg?.group || seg?.label), seconds: st.seconds };
    });
    const { pbs: newPbsList, added } = detectNewPbs(
      data.pbs,
      athlete.id,
      disciplineEntries,
      "training",
      todayStr(),
      `Automaticky z tréninku „${training.title || training.type}“`
    );
    persist((prev) => ({
      ...prev,
      results: existing ? prev.results.map((r) => (r.id === existing.id ? result : r)) : [...prev.results, result],
      pbs: newPbsList,
    }));
    if (added.length > 0) {
      setCelebration(added);
    } else {
      onClose();
    }
  }

  if (celebration) {
    return <PbCelebration pbs={celebration} onDismiss={onClose} />;
  }

  return (
    <div style={{ background: C.surface2, borderRadius: 10, padding: 14, marginTop: 4 }}>
      {isFreeRun && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <Field label="Vzdálenost (km)">
              <TextInput
                type="number"
                step="0.1"
                min={0}
                value={freeKm}
                onChange={(e) => setFreeKm(e.target.value)}
                placeholder="8"
                style={{ width: 110, fontFamily: FONT_MONO }}
              />
            </Field>
            <Field label="Tempo (min/km)">
              <TextInput
                value={freePace}
                onChange={(e) => setFreePace(e.target.value)}
                placeholder="5:30"
                style={{ width: 110, fontFamily: FONT_MONO }}
              />
            </Field>
          </div>
          {freeKm && freePace && parseTime(freePace) && (
            <div style={{ fontSize: 12, color: C.textDim }}>
              Celkový čas: <span style={{ fontFamily: FONT_MONO }}>{fmtTime(parseFloat(String(freeKm).replace(",", ".")) * parseTime(freePace))}</span>
            </div>
          )}
        </div>
      )}

      {training.segments.length === 0 && !isFreeRun && <div style={{ fontSize: 13, color: C.textFaint, marginBottom: 10 }}>Tento trénink nemá definované úseky — zapiš jen pocit a poznámku.</div>}
      {training.segments.map((s) => (
        <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ width: 120, fontSize: 13, color: C.textDim }}>{s.label}</div>
          <TextInput
            placeholder={`cíl ${fmtTarget(s)}`}
            value={times[s.id] || ""}
            onChange={(e) => setTimes({ ...times, [s.id]: e.target.value })}
            style={{ width: 110, fontFamily: FONT_MONO }}
          />
          <div style={{ fontSize: 11, color: C.textFaint }}>{isShortDistance(s.group || s.label) ? "ss.ss" : "mm:ss.ss"}</div>
        </div>
      ))}

      <Field label={`Náročnost (RPE) — ${rpe}/10`}>
        <input type="range" min={1} max={10} value={rpe} onChange={(e) => setRpe(e.target.value)} style={{ width: "100%" }} />
      </Field>
      <Field label="Pocit">
        <Select value={feeling} onChange={(e) => setFeeling(e.target.value)}>
          {FEELINGS.map((f, i) => (
            <option key={i} value={i + 1}>{f}</option>
          ))}
        </Select>
      </Field>
      <Field label="Poznámka (volitelné)">
        <TextArea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Jak ses cítil, počasí, komplikace…" />
      </Field>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn onClick={onClose}>Zrušit</Btn>
        <Btn variant="accent" onClick={submit}><Check size={15} />Uložit</Btn>
      </div>
    </div>
  );
}

// ---------- Coach Today ----------

function CoachToday({ data, persist, setTab, currentUser }) {
  const today = todayStr();
  const todays = data.trainings.filter((t) => t.date === today);
  const athletes = data.users.filter((u) => u.role === "athlete");
  const summary = weeklySummary(data, athletes, null);

  return (
    <div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 600, marginBottom: 2 }}>Ahojda {currentUser.vocative || guessVocative(currentUser.name.split(" ")[0])},</div>
      <SectionTitle icon={Home} right={<Btn variant="accent" onClick={() => setTab("treninky")}><Plus size={15} />Nový trénink</Btn>}>
        Dnes — {fmtDate(today)}
      </SectionTitle>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: C.textFaint, marginBottom: 8 }}>Týdenní souhrn týmu</div>
        <div style={{ fontSize: 14, marginBottom: summary.activeInjuries.length ? 8 : 0 }}>{summary.narrative}</div>
        {summary.activeInjuries.length > 0 && (
          <div style={{ fontSize: 12, color: C.danger }}>
            Aktuálně zraněno: {summary.activeInjuries.map((i) => athletes.find((a) => a.id === i.athleteId)?.name).filter(Boolean).join(", ")}
          </div>
        )}
      </Card>

      {todays.length === 0 && <Empty text="Na dnešek nemáš naplánovaný žádný trénink." />}

      {todays.map((t) => {
        const assigned = athletes.filter((a) => t.assignedTo.includes(a.id));
        const results = data.results.filter((r) => r.trainingId === t.id);
        return (
          <Card key={t.id} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
              <div>
                <Badge bg={C.surface2}>{t.type}</Badge>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 600, marginTop: 4 }}>{t.title || t.type}</div>
              </div>
              <Badge bg={C.surface2} color={C.textDim}>{results.length}/{assigned.length} odesláno</Badge>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {assigned.map((a) => {
                const r = results.find((x) => x.athleteId === a.id);
                const p = r ? computePercent(t, r) : null;
                const absence = data.absences.find((ab) => ab.athleteId === a.id && ab.date === t.date);
                return (
                  <div key={a.id} style={{ background: absence ? C.dangerSoft : C.surface2, borderRadius: 8, padding: "6px 10px", fontSize: 13, display: "flex", gap: 6, alignItems: "center" }}>
                    {a.name}
                    {absence ? (
                      <span style={{ color: C.danger, fontSize: 12 }}>{absence.reason}</span>
                    ) : r ? (
                      <span style={{ fontFamily: FONT_MONO, color: percentColor(p) }}>{p === null ? "✓" : `${p}%`}</span>
                    ) : (
                      <span style={{ color: C.textFaint }}>čeká</span>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}

      <div style={{ marginTop: 28 }}>
        <SectionTitle icon={TrendingUp}>Přehled týmu</SectionTitle>
        <TeamOverviewTable data={data} athletes={athletes} />
      </div>
    </div>
  );
}

function TeamOverviewTable({ data, athletes }) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid " + C.border, textAlign: "left", color: C.textDim }}>
            <th style={{ padding: "8px 10px" }}>Atlet</th>
            <th style={{ padding: "8px 10px" }}>Disciplína</th>
            <th style={{ padding: "8px 10px" }}>Tréninky (30 dní)</th>
            <th style={{ padding: "8px 10px" }}>Průměr splnění</th>
            <th style={{ padding: "8px 10px" }}>Zátěž (acute/chronic)</th>
          </tr>
        </thead>
        <tbody>
          {athletes.map((a) => {
            const results = data.results.filter((r) => r.athleteId === a.id && r.date >= cutoffStr);
            const percents = results
              .map((r) => computePercent(data.trainings.find((t) => t.id === r.trainingId), r))
              .filter((p) => p !== null);
            const avg = percents.length ? Math.round(percents.reduce((s, p) => s + p, 0) / percents.length) : null;
            const acr = acuteChronicRatio(data, a.id);
            return (
              <tr key={a.id} style={{ borderBottom: "1px solid " + C.border }}>
                <td style={{ padding: "8px 10px", fontWeight: 600 }}>{a.name}</td>
                <td style={{ padding: "8px 10px", color: C.textDim }}>{(a.mainDisciplines || []).join(", ") || "—"}</td>
                <td style={{ padding: "8px 10px", fontFamily: FONT_MONO }}>{results.length}</td>
                <td style={{ padding: "8px 10px", fontFamily: FONT_MONO, color: percentColor(avg) }}>{avg === null ? "—" : `${avg}%`}</td>
                <td style={{ padding: "8px 10px", fontFamily: FONT_MONO, color: acr && acr.ratio > 1.5 ? C.danger : C.textDim }}>
                  {acr ? acr.ratio.toFixed(2) + (acr.ratio > 1.5 ? " ⚠" : "") : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {athletes.length === 0 && <Empty text="Zatím nemáš žádné atlety. Přidej je v Nastavení." />}
    </div>
  );
}

// ---------- Calendar ----------

function CalendarView({ data, currentUser }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [selectedDay, setSelectedDay] = useState(null);
  const isCoach = currentUser.role === "coach";

  const first = new Date(cursor.y, cursor.m, 1);
  const startWeekday = (first.getDay() + 6) % 7; // Monday=0
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthName = first.toLocaleDateString("cs-CZ", { month: "long", year: "numeric" });

  function dateOf(d) {
    return `${cursor.y}-${String(cursor.m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  function itemsFor(dateStr) {
    const trainings = data.trainings.filter((t) => t.date === dateStr && (isCoach || t.assignedTo.includes(currentUser.id)));
    const races = data.races.filter((r) => r.date === dateStr && isRaceVisible(r, currentUser.id, isCoach));
    return { trainings, races };
  }

  function periodFor(dateStr) {
    return (data.periods || []).find((p) => dateStr >= p.startDate && dateStr <= p.endDate);
  }

  const today = todayStr();
  const currentPeriod = periodFor(today);

  return (
    <div>
      <SectionTitle
        icon={Calendar}
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Btn variant="ghost" onClick={() => setCursor((c) => (c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 }))}><ChevronLeft size={16} /></Btn>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, textTransform: "capitalize", minWidth: 130, textAlign: "center" }}>{monthName}</div>
            <Btn variant="ghost" onClick={() => setCursor((c) => (c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 }))}><ChevronRight size={16} /></Btn>
          </div>
        }
      >
        Kalendář
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 4 }}>
        {["Po", "Út", "St", "Čt", "Pá", "So", "Ne"].map((d) => (
          <div key={d} style={{ textAlign: "center", fontSize: 11, color: C.textFaint, padding: "4px 0" }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const dateStr = dateOf(d);
          const { trainings, races } = itemsFor(dateStr);
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDay;
          const period = periodFor(dateStr);
          const periodMeta = period && PERIOD_TYPES.find((p) => p.key === period.type);
          return (
            <button
              key={i}
              onClick={() => setSelectedDay(isSelected ? null : dateStr)}
              style={{
                aspectRatio: "1",
                background: isSelected ? C.accentSoft : periodMeta ? periodMeta.color + "26" : C.surface,
                border: "1px solid " + (isToday ? C.accent : C.border),
                borderRadius: 8,
                color: C.text,
                cursor: "pointer",
                padding: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                fontFamily: FONT_MONO,
                fontSize: 12,
                position: "relative",
              }}
            >
              <span style={{ fontWeight: isToday ? 700 : 400, color: isToday ? C.accent : C.text }}>{d}</span>
              <div style={{ display: "flex", gap: 2 }}>
                {trainings.length > 0 && <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.warn }} />}
                {races.length > 0 && <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.accent }} />}
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 12, color: C.textDim, flexWrap: "wrap" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 7, height: 7, borderRadius: "50%", background: C.warn }} />trénink</span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 7, height: 7, borderRadius: "50%", background: C.accent }} />závod</span>
      </div>

      {(data.periods || []).length > 0 && (
        <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 12, color: C.textDim, flexWrap: "wrap" }}>
          {PERIOD_TYPES.filter((pt) => (data.periods || []).some((p) => p.type === pt.key)).map((pt) => (
            <span key={pt.key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: pt.color }} />{pt.label}
            </span>
          ))}
        </div>
      )}

      {currentPeriod && (
        <div style={{ marginTop: 10, fontSize: 12, color: C.textDim }}>
          Aktuální fáze: <strong style={{ color: C.text }}>{currentPeriod.name || PERIOD_TYPES.find((p) => p.key === currentPeriod.type)?.label}</strong>
        </div>
      )}

      {selectedDay && (
        <Card style={{ marginTop: 16 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, marginBottom: 10 }}>{fmtDate(selectedDay)}</div>
          {itemsFor(selectedDay).trainings.map((t) => (
            <div key={t.id} style={{ padding: "8px 0", borderBottom: "1px solid " + C.border, fontSize: 13 }}>
              <Badge bg={C.surface2}>{t.type}</Badge> <span style={{ marginLeft: 6 }}>{t.title || t.type}</span>
              {t.time && <span style={{ color: C.textFaint }}> · {t.time}</span>}
              {t.location && <span style={{ color: C.textFaint }}> · {t.location}</span>}
            </div>
          ))}
          {itemsFor(selectedDay).races.map((r) => {
            const mine = (r.entries || []).find((e) => e.athleteId === currentUser.id);
            const disc = isCoach
              ? [...new Set((r.entries || []).flatMap((e) => e.disciplines))].join(", ")
              : mine
              ? mine.disciplines.join(", ")
              : [...new Set((r.entries || []).flatMap((e) => e.disciplines))].join(", ");
            return (
              <div key={r.id} style={{ padding: "8px 0", borderBottom: "1px solid " + C.border, fontSize: 13 }}>
                <Badge bg={C.accentSoft} color={C.accent}>závod</Badge> <span style={{ marginLeft: 6 }}>{r.name}{disc && ` — ${disc}`}</span>
                {r.location && <span style={{ color: C.textFaint }}> · {r.location}</span>}
              </div>
            );
          })}
          {itemsFor(selectedDay).trainings.length === 0 && itemsFor(selectedDay).races.length === 0 && (
            <div style={{ color: C.textFaint, fontSize: 13 }}>Nic naplánováno.</div>
          )}
        </Card>
      )}
    </div>
  );
}

// ---------- Tréninky ----------

function Treninky({ data, persist, currentUser, isCoach, athletes }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detailId, setDetailId] = useState(null);

  const list = isCoach
    ? [...data.trainings].sort((a, b) => b.date.localeCompare(a.date))
    : data.trainings.filter((t) => t.assignedTo.includes(currentUser.id)).sort((a, b) => b.date.localeCompare(a.date));

  function del(id) {
    persist((prev) => ({ ...prev, trainings: prev.trainings.filter((t) => t.id !== id), results: prev.results.filter((r) => r.trainingId !== id) }));
  }

  if (isCoach && detailId) {
    const training = data.trainings.find((t) => t.id === detailId);
    if (training) {
      return (
        <div>
          <Btn variant="ghost" onClick={() => setDetailId(null)} style={{ marginBottom: 14 }}><ChevronLeft size={15} />Zpět na tréninky</Btn>
          <TrainingDetail training={training} data={data} athletes={athletes} persist={persist} currentUser={currentUser} />
        </div>
      );
    }
  }

  return (
    <div>
      <SectionTitle icon={Activity} right={isCoach && <Btn variant="accent" onClick={() => { setEditing(null); setShowForm(true); }}><Plus size={15} />Nový trénink</Btn>}>
        Tréninky
      </SectionTitle>

      {showForm && (
        <TrainingForm
          athletes={athletes}
          groups={data.groups}
          existing={editing}
          templates={data.templates}
          onSaveTemplate={(tpl) => persist((prev) => ({ ...prev, templates: [...prev.templates, tpl] }))}
          onDeleteTemplate={(id) => persist((prev) => ({ ...prev, templates: prev.templates.filter((x) => x.id !== id) }))}
          onCancel={() => setShowForm(false)}
          onSave={(trainingsArr) => {
            persist((prev) => ({
              ...prev,
              trainings: editing
                ? prev.trainings.map((x) => (x.id === trainingsArr[0].id ? trainingsArr[0] : x))
                : [...prev.trainings, ...trainingsArr],
            }));
            setShowForm(false);
          }}
        />
      )}

      {list.length === 0 && <Empty text="Zatím žádné tréninky." />}

      {list.map((t) => {
        if (isCoach) {
          const assigned = athletes.filter((a) => t.assignedTo.includes(a.id));
          const results = data.results.filter((r) => r.trainingId === t.id);
          return (
            <Card key={t.id} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <button onClick={() => setDetailId(t.id)} style={{ background: "transparent", border: "none", textAlign: "left", cursor: "pointer", padding: 0, color: C.text }}>
                  <div style={{ fontSize: 12, color: C.textFaint }}>{fmtDate(t.date)} {t.time && `· ${t.time}`}</div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 600 }}>{t.title || t.type}</div>
                  <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>
                    {assigned.map((a) => a.name).join(", ") || "nikomu nepřiřazeno"} · {results.length}/{assigned.length} odesláno
                  </div>
                </button>
                <div style={{ display: "flex", gap: 6 }}>
                  <Btn variant="ghost" onClick={() => setDetailId(t.id)}><TrendingUp size={14} /></Btn>
                  <Btn variant="ghost" onClick={() => { setEditing(t); setShowForm(true); }}><Edit2 size={14} /></Btn>
                  <Btn variant="ghost" onClick={() => del(t.id)}><Trash2 size={14} color={C.danger} /></Btn>
                </div>
              </div>
            </Card>
          );
        }
        return <TrainingCard key={t.id} training={t} data={data} persist={persist} athlete={currentUser} />;
      })}
    </div>
  );
}

function TrainingDetail({ training: t, data, athletes, persist, currentUser }) {
  const assigned = athletes.filter((a) => t.assignedTo.includes(a.id));
  const results = data.results.filter((r) => r.trainingId === t.id);
  const percents = results.map((r) => computePercent(t, r)).filter((p) => p !== null);
  const avgPercent = percents.length ? Math.round(percents.reduce((s, p) => s + p, 0) / percents.length) : null;
  const rpes = results.filter((r) => r.rpe).map((r) => r.rpe);
  const avgRpe = rpes.length ? (rpes.reduce((s, r) => s + r, 0) / rpes.length).toFixed(1) : null;

  return (
    <div>
      <SectionTitle icon={TrendingUp}>{t.title || t.type}</SectionTitle>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
          <Badge bg={C.surface2}>{t.type}</Badge>
          <span style={{ fontSize: 13, color: C.textFaint }}>{fmtDate(t.date)} {t.time && `· ${t.time}`} {t.location && `· ${t.location}`}</span>
        </div>
        {t.description && <div style={{ fontSize: 13, color: C.textDim, marginBottom: 10 }}>{t.description}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px,1fr))", gap: 10 }}>
          <div style={{ background: C.surface2, borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 11, color: C.textDim }}>Odesláno</div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 20, fontWeight: 600 }}>{results.length}/{assigned.length}</div>
          </div>
          <div style={{ background: C.surface2, borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 11, color: C.textDim }}>Průměrné splnění</div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 20, fontWeight: 600, color: percentColor(avgPercent) }}>{avgPercent === null ? "—" : `${avgPercent}%`}</div>
          </div>
          <div style={{ background: C.surface2, borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 11, color: C.textDim }}>Průměrné RPE</div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 20, fontWeight: 600 }}>{avgRpe || "—"}</div>
          </div>
        </div>
      </Card>

      {t.segments && t.segments.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: C.textFaint, marginBottom: 10 }}>Rozbor podle úseků</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid " + C.border, textAlign: "left", color: C.textDim }}>
                  <th style={{ padding: "6px 10px" }}>Úsek</th>
                  <th style={{ padding: "6px 10px" }}>Cíl</th>
                  <th style={{ padding: "6px 10px" }}>Nejlepší</th>
                  <th style={{ padding: "6px 10px" }}>Průměr</th>
                  <th style={{ padding: "6px 10px" }}>Zapsáno</th>
                </tr>
              </thead>
              <tbody>
                {t.segments.map((seg) => {
                  const times = results
                    .map((r) => r.segmentTimes.find((st) => st.segmentId === seg.id))
                    .filter(Boolean)
                    .map((st) => st.seconds);
                  const best = times.length ? Math.min(...times) : null;
                  const avg = times.length ? times.reduce((s, x) => s + x, 0) / times.length : null;
                  const short = isShortDistance(seg.group || seg.label);
                  return (
                    <tr key={seg.id} style={{ borderBottom: "1px solid " + C.border }}>
                      <td style={{ padding: "6px 10px", fontWeight: 600 }}>{seg.label}</td>
                      <td style={{ padding: "6px 10px", fontFamily: FONT_MONO, color: C.textDim }}>{fmtTarget(seg)}</td>
                      <td style={{ padding: "6px 10px", fontFamily: FONT_MONO, color: C.success }}>{best !== null ? fmtTime(best, short) : "—"}</td>
                      <td style={{ padding: "6px 10px", fontFamily: FONT_MONO }}>{avg !== null ? fmtTime(avg, short) : "—"}</td>
                      <td style={{ padding: "6px 10px", color: C.textFaint }}>{times.length}/{assigned.length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card>
        <div style={{ fontSize: 12, color: C.textFaint, marginBottom: 10 }}>Výsledky jednotlivých atletů</div>
        {assigned.length === 0 && <Empty text="Trénink není nikomu přiřazen." />}
        {assigned.map((a) => {
          const r = results.find((x) => x.athleteId === a.id);
          const percent = r ? computePercent(t, r) : null;
          const absence = data.absences.find((ab) => ab.athleteId === a.id && ab.date === t.date);
          return (
            <div key={a.id} style={{ padding: "12px 0", borderBottom: "1px solid " + C.border }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div style={{ fontWeight: 600 }}>{a.name}</div>
                {absence ? (
                  <Badge bg={C.dangerSoft} color={C.danger}>{absence.reason}{absence.note ? ` — ${absence.note}` : ""}</Badge>
                ) : r ? (
                  <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 12, color: C.textDim }}>
                    <span style={{ fontFamily: FONT_MONO, color: percentColor(percent), fontSize: 14 }}>{percent === null ? "zapsáno" : `${percent}%`}</span>
                    <span>RPE {r.rpe}/10</span>
                    <span>{FEELINGS[r.feeling - 1] || "—"}</span>
                  </div>
                ) : (
                  <Badge bg={C.surface2} color={C.textFaint}>nezapsáno</Badge>
                )}
              </div>
              {r && r.freeRun && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                  <div style={{ background: C.surface2, borderRadius: 8, padding: "4px 8px", fontSize: 11 }}>
                    <span style={{ color: C.textFaint }}>Vzdálenost</span> <span style={{ fontFamily: FONT_MONO }}>{r.freeRun.km} km</span>
                  </div>
                  <div style={{ background: C.surface2, borderRadius: 8, padding: "4px 8px", fontSize: 11 }}>
                    <span style={{ color: C.textFaint }}>Tempo</span> <span style={{ fontFamily: FONT_MONO }}>{fmtTime(r.freeRun.paceSeconds)} /km</span>
                  </div>
                  <div style={{ background: C.surface2, borderRadius: 8, padding: "4px 8px", fontSize: 11 }}>
                    <span style={{ color: C.textFaint }}>Celkem</span> <span style={{ fontFamily: FONT_MONO }}>{fmtTime(r.freeRun.totalSeconds)}</span>
                  </div>
                </div>
              )}
              {r && (t.segments || []).length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                  {t.segments.map((seg) => {
                    const st = r.segmentTimes.find((x) => x.segmentId === seg.id);
                    return (
                      <div key={seg.id} style={{ background: C.surface2, borderRadius: 8, padding: "4px 8px", fontSize: 11 }}>
                        <span style={{ color: C.textFaint }}>{seg.label}</span>{" "}
                        {st ? <span style={{ fontFamily: FONT_MONO }}>{fmtTime(st.seconds, isShortDistance(seg.group || seg.label))}</span> : <span style={{ color: C.textFaint }}>—</span>}
                      </div>
                    );
                  })}
                </div>
              )}
              {r && r.note && <div style={{ fontSize: 12, color: C.textFaint, marginTop: 6 }}>„{r.note}“</div>}
              <CommentThread data={data} persist={persist} trainingId={t.id} athleteId={a.id} currentUser={currentUser} />
            </div>
          );
        })}
      </Card>
    </div>
  );
}

function TrainingForm({ athletes, groups, existing, onCancel, onSave, templates, onSaveTemplate, onDeleteTemplate }) {
  const [date, setDate] = useState(existing?.date || todayStr());
  const [time, setTime] = useState(existing?.time || "");
  const [location, setLocation] = useState(existing?.location || "");
  const [type, setType] = useState(existing?.type || TRAINING_TYPES[0]);
  const [title, setTitle] = useState(existing?.title || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [durationMinutes, setDurationMinutes] = useState(existing?.durationMinutes || 60);
  const [segments, setSegments] = useState(existing?.segments || []);
  const [assignedTo, setAssignedTo] = useState(existing?.assignedTo || []);
  const [pattern, setPattern] = useState("");
  const [groupTargets, setGroupTargets] = useState({});
  const [repeatWeeks, setRepeatWeeks] = useState(1);
  const [templateName, setTemplateName] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);

  function addSegment() {
    setSegments([...segments, { id: uid(), label: "", targetSeconds: null, targetMax: null }]);
  }
  function updateSegment(id, patch) {
    setSegments(segments.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }
  function removeSegment(id) {
    setSegments(segments.filter((s) => s.id !== id));
  }
  function toggleAthlete(id) {
    setAssignedTo((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }
  function addGroup(ids) {
    setAssignedTo((prev) => [...new Set([...prev, ...ids])]);
  }

  function generateFromPattern() {
    const generated = parseSegmentPattern(pattern);
    if (generated.length === 0) return;
    setSegments((prev) => [...prev, ...generated]);
    setPattern("");
  }

  function applyGroupTarget(group) {
    const range = parseTimeRange(groupTargets[group]);
    if (!range) return;
    setSegments((prev) =>
      prev.map((s) => ((s.group || s.label) === group ? { ...s, targetSeconds: range.min, targetMax: range.max } : s))
    );
  }

  function loadTemplate(tpl) {
    setType(tpl.type);
    setTitle(tpl.title);
    setDescription(tpl.description);
    setDurationMinutes(tpl.durationMinutes || 60);
    setSegments((tpl.segments || []).map((s) => ({ ...s, id: uid() })));
    setShowTemplates(false);
  }

  function saveAsTemplate() {
    if (!templateName.trim()) return;
    onSaveTemplate({ id: uid(), name: templateName.trim(), type, title, description, durationMinutes, segments });
    setTemplateName("");
  }

  const segmentGroups = [...new Set(segments.map((s) => s.group || s.label).filter(Boolean))];

  function save() {
    const base = { id: existing?.id || uid(), date, time, location, type, title, description, durationMinutes: Number(durationMinutes) || 60, segments, assignedTo };
    if (existing || repeatWeeks <= 1) {
      onSave([base]);
      return;
    }
    const list = [base];
    for (let i = 1; i < repeatWeeks; i++) {
      const d = new Date(date + "T00:00:00");
      d.setDate(d.getDate() + i * 7);
      list.push({ ...base, id: uid(), date: d.toISOString().slice(0, 10) });
    }
    onSave(list);
  }

  return (
    <Card style={{ marginBottom: 20 }}>
      {templates && templates.length > 0 && (
        <Field label="Šablona">
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <Btn onClick={() => setShowTemplates(!showTemplates)}>
              <ChevronDown size={14} />Načíst ze šablony ({templates.length})
            </Btn>
          </div>
          {showTemplates && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              {templates.map((tpl) => (
                <div key={tpl.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: C.surface2, borderRadius: 8, padding: "6px 10px" }}>
                  <button onClick={() => loadTemplate(tpl)} style={{ background: "transparent", border: "none", color: C.text, cursor: "pointer", textAlign: "left", fontSize: 13, flex: 1 }}>
                    <strong>{tpl.name}</strong> <span style={{ color: C.textFaint }}>· {tpl.type}, {(tpl.segments || []).length} úseků</span>
                  </button>
                  <Btn variant="ghost" onClick={() => onDeleteTemplate(tpl.id)}><Trash2 size={13} color={C.danger} /></Btn>
                </div>
              ))}
            </div>
          )}
        </Field>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Datum"><TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <Field label="Čas"><TextInput type="time" value={time} onChange={(e) => setTime(e.target.value)} /></Field>
        <Field label="Místo"><TextInput value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Atletický stadion" /></Field>
        <Field label="Typ tréninku">
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            {TRAINING_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
        </Field>
      </div>
      <Field label="Název (volitelné)"><TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="např. 10x400m" /></Field>
      <Field label="Popis"><TextArea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Rozcvička, hlavní část, uvolnění…" /></Field>
      <Field label="Odhadovaná délka tréninku (minuty)">
        <TextInput type="number" min={0} value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} style={{ width: 120 }} />
        <div style={{ fontSize: 11, color: C.textFaint, marginTop: 4 }}>Používá se k výpočtu tréninkové zátěže (RPE × délka).</div>
      </Field>

      {type === "Výběh" ? (
        <div style={{ fontSize: 12, color: C.textDim, background: C.surface2, borderRadius: 8, padding: "10px 12px", marginBottom: 14 }}>
          U tréninku typu <strong>Výběh</strong> nemusíš zadávat úseky — atlet po tréninku sám zapíše uběhnutou vzdálenost a tempo na kilometr.
        </div>
      ) : (
      <>
      <Field label="Rychlé zadání úseků">
        <div style={{ display: "flex", gap: 8 }}>
          <TextInput
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), generateFromPattern())}
            placeholder="např. 4x400 m + 3x300 m"
            style={{ flex: 1 }}
          />
          <Btn variant="accent" onClick={generateFromPattern}><Plus size={14} />Vytvořit úseky</Btn>
        </div>
        <div style={{ fontSize: 11, color: C.textFaint, marginTop: 6 }}>
          Zapiš vzorec ve tvaru počet×vzdálenost, více skupin odděl "+" (např. "6x200 m + 2x400 m"). Úseky se vytvoří automaticky.
        </div>
      </Field>

      {segmentGroups.length > 0 && (
        <Field label="Cíl pro celou skupinu (nastaví se všem úsekům najednou)">
          {segmentGroups.map((g) => {
            const count = segments.filter((s) => (s.group || s.label) === g).length;
            return (
              <div key={g} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, background: C.surface2, padding: "6px 10px", borderRadius: 8 }}>
                <div style={{ flex: 1, fontSize: 13 }}>
                  {g} <span style={{ color: C.textFaint, fontSize: 11 }}>({count}×)</span>
                </div>
                <TextInput
                  value={groupTargets[g] || ""}
                  onChange={(e) => setGroupTargets({ ...groupTargets, [g]: e.target.value })}
                  placeholder={isShortDistance(g) ? "ss.ss nebo 75-80" : "mm:ss nebo rozsah"}
                  style={{ width: 150, fontFamily: FONT_MONO }}
                />
                <Btn onClick={() => applyGroupTarget(g)}>Použít na všechny</Btn>
              </div>
            );
          })}
        </Field>
      )}

      <Field label="Jednotlivé úseky">
        {segments.map((s) => (
          <div key={s.id} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
            <TextInput
              placeholder="např. 400m"
              value={s.label}
              onChange={(e) => updateSegment(s.id, { label: e.target.value })}
              onBlur={(e) => {
                const norm = normalizeDiscipline(e.target.value);
                updateSegment(s.id, { label: norm, group: norm });
              }}
              style={{ flex: 2 }}
            />
            <TextInput
              placeholder={isShortDistance(s.group || s.label) ? "ss.ss nebo 75-80" : "mm:ss nebo rozsah"}
              defaultValue={s.targetSeconds !== null && s.targetSeconds !== undefined ? fmtTarget(s) : ""}
              onBlur={(e) => {
                const r = parseTimeRange(e.target.value);
                updateSegment(s.id, { targetSeconds: r ? r.min : null, targetMax: r ? r.max : null });
              }}
              style={{ flex: 1, fontFamily: FONT_MONO }}
            />
            <Btn variant="ghost" onClick={() => removeSegment(s.id)}><X size={14} /></Btn>
          </div>
        ))}
        <Btn onClick={addSegment}><Plus size={14} />Přidat úsek ručně</Btn>
      </Field>
      </>
      )}

      <Field label="Přiřadit atletům">
        {groups && groups.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
            {groups.map((g) => (
              <Btn key={g.id} onClick={() => addGroup(g.athleteIds || [])}>
                <Users size={13} />{g.name} ({(g.athleteIds || []).length})
              </Btn>
            ))}
          </div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {athletes.map((a) => (
            <button
              key={a.id}
              onClick={() => toggleAthlete(a.id)}
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                border: "1px solid " + (assignedTo.includes(a.id) ? C.accent : C.border),
                background: assignedTo.includes(a.id) ? C.accentSoft : C.surface2,
                color: assignedTo.includes(a.id) ? C.accent : C.textDim,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {a.name}
            </button>
          ))}
          {athletes.length === 0 && <span style={{ color: C.textFaint, fontSize: 13 }}>Nejdřív přidej atlety v Nastavení.</span>}
        </div>
      </Field>

      {!existing && (
        <Field label="Opakovat každý týden">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <TextInput type="number" min={1} max={26} value={repeatWeeks} onChange={(e) => setRepeatWeeks(Number(e.target.value) || 1)} style={{ width: 90 }} />
            <span style={{ fontSize: 13, color: C.textDim }}>týdnů (1 = jen tento trénink)</span>
          </div>
        </Field>
      )}

      <Field label="Uložit jako šablonu (pro příští použití)">
        <div style={{ display: "flex", gap: 8 }}>
          <TextInput value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="např. Úterní intervaly" style={{ flex: 1 }} />
          <Btn onClick={saveAsTemplate}><Plus size={14} />Uložit šablonu</Btn>
        </div>
      </Field>

      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
        <Btn onClick={onCancel}>Zrušit</Btn>
        <Btn variant="accent" onClick={save}><Check size={15} />Uložit trénink{!existing && repeatWeeks > 1 ? ` (${repeatWeeks}×)` : ""}</Btn>
      </div>
    </Card>
  );
}

// ---------- Závody ----------

function Zavody({ data, persist, isCoach, athletes, currentUser }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const list = [...data.races]
    .filter((r) => isRaceVisible(r, currentUser.id, isCoach))
    .sort((a, b) => a.date.localeCompare(b.date));

  function del(id) {
    persist((prev) => ({ ...prev, races: prev.races.filter((r) => r.id !== id) }));
  }

  return (
    <div>
      <SectionTitle icon={Flag} right={isCoach && <Btn variant="accent" onClick={() => { setEditing(null); setShowForm(true); }}><Plus size={15} />Přidat závod</Btn>}>
        Závody
      </SectionTitle>

      {showForm && (
        <RaceForm
          existing={editing}
          athletes={athletes}
          onCancel={() => setShowForm(false)}
          onSave={(r) => {
            persist((prev) => ({ ...prev, races: editing ? prev.races.map((x) => (x.id === r.id ? r : x)) : [...prev.races, r] }));
            setShowForm(false);
          }}
        />
      )}

      {list.length === 0 && <Empty text="Zatím žádné závody v kalendáři." />}

      {list.map((r) => (
        <RaceCard
          key={r.id}
          race={r}
          isCoach={isCoach}
          athletes={athletes}
          currentUser={currentUser}
          data={data}
          persist={persist}
          onEdit={() => { setEditing(r); setShowForm(true); }}
          onDelete={() => del(r.id)}
        />
      ))}
    </div>
  );
}

function RaceCard({ race: r, isCoach, athletes, currentUser, data, persist, onEdit, onDelete }) {
  const [showLog, setShowLog] = useState(false);
  const today = todayStr();
  const past = r.date < today;
  const d = daysUntil(r.date);
  const entries = r.entries || [];
  const allDisciplines = [...new Set(entries.flatMap((e) => e.disciplines))];
  const myEntry = !isCoach && entries.find((e) => e.athleteId === currentUser.id);
  const myResult = !isCoach && data.raceResults.find((res) => res.raceId === r.id && res.athleteId === currentUser.id);

  return (
    <Card style={{ marginBottom: 10, opacity: past ? 0.55 : 1, borderColor: r.goal && !past ? C.accent : C.border }}>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
            {r.goal && <Badge bg={C.accentSoft} color={C.accent}>cílový</Badge>}
            <span style={{ fontSize: 12, color: C.textFaint }}>{fmtDate(r.date)}</span>
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 600 }}>{r.name}</div>
          <div style={{ fontSize: 13, color: C.textDim }}>
            {isCoach ? (allDisciplines.join(", ") || "—") : (myEntry ? myEntry.disciplines.join(", ") : allDisciplines.join(", ") || "—")}
            {r.location && ` · ${r.location}`}
          </div>
          {isCoach && (
            <div style={{ fontSize: 11, color: C.textFaint, marginTop: 4 }}>
              {entries.length
                ? entries.map((e) => {
                    const res = data.raceResults.find((x) => x.raceId === r.id && x.athleteId === e.athleteId);
                    const name = athletes.find((a) => a.id === e.athleteId)?.name;
                    const timesStr = res ? res.times.map((t) => `${t.discipline} ${fmtTime(t.seconds, isShortDistance(t.discipline))}`).join(", ") : e.disciplines.join(", ") + " (nezapsáno)";
                    return `${name}: ${timesStr}`;
                  }).join(" · ")
                : "Pro celý tým"}
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 18, fontWeight: 600, color: past ? C.textFaint : C.text }}>
              {past ? "proběhl" : `${d} dní`}
            </div>
          </div>
          {isCoach && (
            <div style={{ display: "flex", gap: 4 }}>
              <Btn variant="ghost" onClick={onEdit}><Edit2 size={14} /></Btn>
              <Btn variant="ghost" onClick={onDelete}><Trash2 size={14} color={C.danger} /></Btn>
            </div>
          )}
        </div>
      </div>

      {myEntry && myEntry.disciplines.length > 0 && (
        <div style={{ marginTop: 12 }}>
          {myResult && !showLog && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
              {myResult.times.map((t) => (
                <div key={t.discipline} style={{ background: C.surface2, borderRadius: 8, padding: "6px 10px", fontSize: 12 }}>
                  <span style={{ color: C.textDim }}>{t.discipline}</span>{" "}
                  <span style={{ fontFamily: FONT_MONO, color: C.text }}>{fmtTime(t.seconds, isShortDistance(t.discipline))}</span>
                </div>
              ))}
            </div>
          )}
          {!showLog ? (
            <Btn variant={myResult ? "default" : "accent"} onClick={() => setShowLog(true)}>
              <Plus size={15} />
              {myResult ? "Upravit časy" : "Zapsat časy"}
            </Btn>
          ) : (
            <RaceResultForm race={r} athleteId={currentUser.id} myEntry={myEntry} existing={myResult} data={data} persist={persist} onClose={() => setShowLog(false)} />
          )}
        </div>
      )}
    </Card>
  );
}

function RaceResultForm({ race, athleteId, myEntry, existing, data, persist, onClose }) {
  const [times, setTimes] = useState(() => {
    const map = {};
    (existing?.times || []).forEach((t) => (map[t.discipline] = fmtTime(t.seconds, isShortDistance(t.discipline))));
    return map;
  });
  const [note, setNote] = useState(existing?.note || "");
  const [celebration, setCelebration] = useState(null);

  function submit() {
    const timesArr = myEntry.disciplines
      .map((disc) => ({ discipline: disc, seconds: parseTime(times[disc]) }))
      .filter((t) => t.seconds !== null);

    const result = { id: existing?.id || uid(), raceId: race.id, athleteId, date: race.date, times: timesArr, note };
    const { pbs: newPbsList, added } = detectNewPbs(
      data.pbs,
      athleteId,
      timesArr,
      "race",
      race.date,
      `Automaticky ze závodu „${race.name}“`
    );

    persist((prev) => ({
      ...prev,
      raceResults: existing ? prev.raceResults.map((x) => (x.id === existing.id ? result : x)) : [...prev.raceResults, result],
      pbs: newPbsList,
    }));

    if (added.length > 0) {
      setCelebration(added);
    } else {
      onClose();
    }
  }

  if (celebration) {
    return <PbCelebration pbs={celebration} onDismiss={onClose} />;
  }

  return (
    <div style={{ background: C.surface2, borderRadius: 10, padding: 14, marginTop: 4 }}>
      {myEntry.disciplines.map((d) => (
        <div key={d} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ width: 140, fontSize: 13, color: C.textDim }}>{d}</div>
          <TextInput
            placeholder={isShortDistance(d) ? "ss.ss" : "mm:ss.ss"}
            value={times[d] || ""}
            onChange={(e) => setTimes({ ...times, [d]: e.target.value })}
            style={{ width: 110, fontFamily: FONT_MONO }}
          />
        </div>
      ))}
      <Field label="Poznámka (volitelné)"><TextArea value={note} onChange={(e) => setNote(e.target.value)} placeholder="umístění, podmínky…" /></Field>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn onClick={onClose}>Zrušit</Btn>
        <Btn variant="accent" onClick={submit}><Check size={15} />Uložit</Btn>
      </div>
    </div>
  );
}

function RaceForm({ existing, onCancel, onSave, athletes }) {
  const [name, setName] = useState(existing?.name || "");
  const [date, setDate] = useState(existing?.date || todayStr());
  const [location, setLocation] = useState(existing?.location || "");
  const [goal, setGoal] = useState(existing?.goal || false);
  const [entries, setEntries] = useState(() => {
    const map = {};
    (existing?.entries || []).forEach((e) => { map[e.athleteId] = e.disciplines || []; });
    return map;
  });

  function toggleAthleteIncluded(id) {
    setEntries((prev) => {
      const next = { ...prev };
      if (id in next) delete next[id];
      else next[id] = [];
      return next;
    });
  }
  function toggleDisciplineForAthlete(id, d) {
    setEntries((prev) => {
      const cur = prev[id] || [];
      const nextList = cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d];
      return { ...prev, [id]: nextList };
    });
  }

  function save() {
    if (!name.trim()) return;
    const entriesArr = Object.entries(entries)
      .filter(([, disciplines]) => disciplines.length > 0)
      .map(([athleteId, disciplines]) => ({ athleteId, disciplines }));
    onSave({ id: existing?.id || uid(), name: name.trim(), date, location, goal, entries: entriesArr });
  }

  return (
    <Card style={{ marginBottom: 20 }}>
      <Field label="Název závodu"><TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Mistrovství kraje" /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Datum"><TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <Field label="Místo"><TextInput value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Praha" /></Field>
      </div>
      <div style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
        <input type="checkbox" checked={goal} onChange={(e) => setGoal(e.target.checked)} id="goalrace" />
        <label htmlFor="goalrace" style={{ fontSize: 13, color: C.textDim }}>Toto je cílový (hlavní) závod sezóny</label>
      </div>

      <Field label="Kdo jede a v jakých disciplínách">
        {athletes.length === 0 && <span style={{ color: C.textFaint, fontSize: 13 }}>Nejdřív přidej atlety v Nastavení.</span>}
        {athletes.map((a) => {
          const included = a.id in entries;
          const disciplines = entries[a.id] || [];
          return (
            <div key={a.id} style={{ marginBottom: 10, background: C.surface2, borderRadius: 10, padding: "10px 12px" }}>
              <button
                onClick={() => toggleAthleteIncluded(a.id)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: included ? C.accent : C.text,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {included ? <Check size={14} /> : <Plus size={14} />}
                {a.name}
              </button>
              {included && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                  {DISCIPLINES.map((d) => (
                    <button
                      key={d}
                      onClick={() => toggleDisciplineForAthlete(a.id, d)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 999,
                        border: "1px solid " + (disciplines.includes(d) ? C.accent : C.border),
                        background: disciplines.includes(d) ? C.accentSoft : C.surface,
                        color: disciplines.includes(d) ? C.accent : C.textDim,
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div style={{ fontSize: 11, color: C.textFaint, marginTop: 4 }}>
          {Object.keys(entries).length === 0 ? "Nikdo nevybrán → závod uvidí celý tým." : "Uvidí ho jen vybraní atleti, každý u sebe s vlastními disciplínami."}
        </div>
      </Field>

      <div style={{ display: "flex", gap: 8 }}>
        <Btn onClick={onCancel}>Zrušit</Btn>
        <Btn variant="accent" onClick={save}><Check size={15} />Uložit</Btn>
      </div>
    </Card>
  );
}

// ---------- Athlete Card ----------

function BestTable({ title, pbs, type, canEdit, onEdit }) {
  const filtered = pbs.filter((p) => p.type === type);
  const disciplines = [...new Set(filtered.map((p) => p.discipline))];
  const rows = disciplines
    .map((d) => {
      const items = filtered.filter((p) => p.discipline === d);
      return items.reduce((best, p) => (p.seconds < best.seconds ? p : best));
    })
    .sort((a, b) => a.discipline.localeCompare(b.discipline, "cs"));

  return (
    <Card style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 12, color: C.textFaint, marginBottom: 10 }}>{title}</div>
      {rows.length === 0 ? (
        <Empty text="Zatím žádné záznamy." />
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid " + C.border, textAlign: "left", color: C.textDim }}>
                <th style={{ padding: "8px 10px" }}>Disciplína</th>
                <th style={{ padding: "8px 10px" }}>Čas</th>
                <th style={{ padding: "8px 10px" }}>Datum</th>
                {canEdit && <th style={{ padding: "8px 10px" }}></th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid " + C.border }}>
                  <td style={{ padding: "8px 10px", fontWeight: 600 }}>{r.discipline}</td>
                  <td style={{ padding: "8px 10px", fontFamily: FONT_MONO }}>{fmtTime(r.seconds, isShortDistance(r.discipline))}</td>
                  <td style={{ padding: "8px 10px", color: C.textFaint }}>{fmtDateShort(r.date)}</td>
                  {canEdit && (
                    <td style={{ padding: "8px 10px", textAlign: "right" }}>
                      <Btn variant="ghost" onClick={() => onEdit(r)}><Edit2 size={13} /></Btn>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function AthleteCard({ data, persist, athlete, canEdit }) {
  const [showPbForm, setShowPbForm] = useState(false);
  const [editingPb, setEditingPb] = useState(null);
  const [chartDiscipline, setChartDiscipline] = useState(null);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const pbs = data.pbs.filter((p) => p.athleteId === athlete.id).sort((a, b) => b.date.localeCompare(a.date));
  const disciplines = [...new Set(pbs.map((p) => p.discipline))];
  const activeDiscipline = chartDiscipline || (athlete.mainDisciplines || [])[0] || disciplines[0];

  const chartData = pbs
    .filter((p) => p.discipline === activeDiscipline)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((p) => ({ date: fmtDateShort(p.date), seconds: p.seconds, type: p.type }));

  const yearStart = `${new Date().getFullYear()}-01-01`;
  const today = todayStr();
  const seasonRaces = data.races.filter((r) => r.date >= yearStart && (r.entries || []).some((e) => e.athleteId === athlete.id));
  const seasonPbCount = pbs.filter((p) => p.date >= yearStart).length;
  const seasonTrainings = data.trainings.filter((t) => t.assignedTo.includes(athlete.id) && t.date >= yearStart && t.date <= today);
  const loggedCount = seasonTrainings.filter((t) => data.results.some((r) => r.trainingId === t.id && r.athleteId === athlete.id)).length;
  const attendanceRate = seasonTrainings.length ? Math.round((loggedCount / seasonTrainings.length) * 100) : null;

  const loadData_ = weeklyLoads(data, athlete.id, 12);
  const acr = acuteChronicRatio(data, athlete.id);

  const goals = (data.goals || []).filter((g) => g.athleteId === athlete.id);
  const injuries = (data.injuries || []).filter((i) => i.athleteId === athlete.id).sort((a, b) => b.startDate.localeCompare(a.startDate));
  const activeInjury = injuries.find((i) => !i.endDate || i.endDate >= today);
  const [showInjuryForm, setShowInjuryForm] = useState(false);
  const [editingInjury, setEditingInjury] = useState(null);

  function delGoal(id) {
    persist((prev) => ({ ...prev, goals: prev.goals.filter((g) => g.id !== id) }));
  }

  function delInjury(id) {
    persist((prev) => ({ ...prev, injuries: prev.injuries.filter((i) => i.id !== id) }));
  }

  function del(id) {
    persist((prev) => ({ ...prev, pbs: prev.pbs.filter((p) => p.id !== id) }));
  }

  return (
    <div>
      <SectionTitle
        icon={Trophy}
        right={canEdit && <Btn variant="accent" onClick={() => { setEditingPb(null); setShowPbForm(true); }}><Plus size={15} />Přidat výkon</Btn>}
      >
        Karta atleta — {athlete.name} {activeInjury && <Badge bg={C.dangerSoft} color={C.danger}>zraněn/á</Badge>}
      </SectionTitle>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: C.textFaint, marginBottom: 10 }}>Sezóna {new Date().getFullYear()}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px,1fr))", gap: 10 }}>
          <div style={{ background: C.surface2, borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 11, color: C.textDim }}>Závody</div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 20, fontWeight: 600 }}>{seasonRaces.length}</div>
          </div>
          <div style={{ background: C.surface2, borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 11, color: C.textDim }}>Nové rekordy</div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 20, fontWeight: 600 }}>{seasonPbCount}</div>
          </div>
          <div style={{ background: C.surface2, borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 11, color: C.textDim }}>Docházka</div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 20, fontWeight: 600, color: attendanceRate === null ? C.textFaint : percentColor(attendanceRate) }}>
              {attendanceRate === null ? "—" : `${attendanceRate}%`}
            </div>
          </div>
          {acr && (
            <div style={{ background: acr.ratio > 1.5 ? C.dangerSoft : C.surface2, borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 11, color: C.textDim }}>Akutní/chronická zátěž</div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 20, fontWeight: 600, color: acr.ratio > 1.5 ? C.danger : C.text }}>{acr.ratio.toFixed(2)}</div>
            </div>
          )}
        </div>
        {acr && acr.ratio > 1.5 && (
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 12, color: C.danger, fontSize: 12 }}>
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>Zátěž posledních 7 dní je výrazně vyšší než dlouhodobý průměr — zvýšené riziko přetížení/zranění.</span>
          </div>
        )}
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: C.textFaint, marginBottom: 10 }}>Wellness — posledních 7 dní</div>
        {(() => {
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - 7);
          const cutoffStr = cutoff.toISOString().slice(0, 10);
          const recent = data.wellness.filter((w) => w.athleteId === athlete.id && w.date >= cutoffStr);
          if (recent.length === 0) return <Empty text="Zatím žádné záznamy." />;
          const avg = (key) => recent.reduce((s, w) => s + w[key], 0) / recent.length;
          const avgSleep = avg("sleep"), avgSoreness = avg("soreness"), avgMood = avg("mood");
          const concerning = avgSleep < 2.5 || avgSoreness < 2.5 || avgMood < 2.5;
          return (
            <div>
              <div style={{ display: "flex", gap: 20, fontSize: 13 }}>
                <span>😴 Spánek: {avgSleep.toFixed(1)}/5</span>
                <span>💪 Bez bolesti: {avgSoreness.toFixed(1)}/5</span>
                <span>🙂 Nálada: {avgMood.toFixed(1)}/5</span>
              </div>
              {concerning && (
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 10, color: C.warn, fontSize: 12 }}>
                  <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>Některý z ukazatelů je dlouhodobě nízký — stojí za řeč s atletem o regeneraci.</span>
                </div>
              )}
            </div>
          );
        })()}
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 12, color: C.textFaint }}>Zranění a zdravotní stav</div>
          {canEdit && <Btn onClick={() => { setEditingInjury(null); setShowInjuryForm(true); }}><Plus size={14} />Přidat záznam</Btn>}
        </div>
        {injuries.length === 0 && <Empty text="Žádné zaznamenané zranění." />}
        {injuries.map((i) => (
          <div key={i.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid " + C.border }}>
            <div>
              <span style={{ fontWeight: 600 }}>{i.description}</span>{" "}
              {(!i.endDate || i.endDate >= today) && <Badge bg={C.dangerSoft} color={C.danger}>aktivní</Badge>}
              <div style={{ fontSize: 12, color: C.textFaint, marginTop: 2 }}>
                {fmtDateShort(i.startDate)}{i.endDate ? ` – ${fmtDateShort(i.endDate)}` : " – trvá"}
                {i.note ? ` · ${i.note}` : ""}
              </div>
            </div>
            {canEdit && (
              <div style={{ display: "flex", gap: 4 }}>
                <Btn variant="ghost" onClick={() => { setEditingInjury(i); setShowInjuryForm(true); }}><Edit2 size={13} /></Btn>
                <Btn variant="ghost" onClick={() => delInjury(i.id)}><Trash2 size={13} color={C.danger} /></Btn>
              </div>
            )}
          </div>
        ))}
        {showInjuryForm && (
          <InjuryForm
            existing={editingInjury}
            athleteId={athlete.id}
            onCancel={() => setShowInjuryForm(false)}
            onSave={(inj) => {
              persist((prev) => ({ ...prev, injuries: editingInjury ? prev.injuries.map((x) => (x.id === inj.id ? inj : x)) : [...(prev.injuries || []), inj] }));
              setShowInjuryForm(false);
            }}
          />
        )}
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 12, color: C.textFaint }}>Sezónní cíle</div>
          {canEdit && <Btn onClick={() => { setEditingGoal(null); setShowGoalForm(true); }}><Plus size={14} />Přidat cíl</Btn>}
        </div>
        {goals.length === 0 && <Empty text="Zatím žádný sezónní cíl." />}
        {goals.map((g) => {
          const best = pbs.filter((p) => p.discipline === g.discipline && p.type === "race").reduce((b, p) => (!b || p.seconds < b.seconds ? p : b), null);
          const gap = best ? best.seconds - g.targetSeconds : null;
          const daysLeft = g.targetDate ? daysUntil(g.targetDate) : null;
          return (
            <div key={g.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid " + C.border }}>
              <div>
                <span style={{ fontWeight: 600 }}>{g.discipline}</span>{" "}
                <span style={{ color: C.textFaint, fontSize: 12 }}>cíl</span>{" "}
                <span style={{ fontFamily: FONT_MONO }}>{fmtTime(g.targetSeconds, isShortDistance(g.discipline))}</span>
                {g.targetDate && <span style={{ color: C.textFaint, fontSize: 12 }}> · do {fmtDateShort(g.targetDate)}{daysLeft >= 0 ? ` (${daysLeft} dní)` : ""}</span>}
                <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>
                  {best
                    ? gap > 0
                      ? `Aktuální nejlepší ${fmtTime(best.seconds, isShortDistance(g.discipline))} · chybí ${fmtTime(gap, isShortDistance(g.discipline))}`
                      : `Cíl splněn! Nejlepší ${fmtTime(best.seconds, isShortDistance(g.discipline))}`
                    : "Zatím žádný závodní čas v této disciplíně"}
                </div>
              </div>
              {canEdit && (
                <div style={{ display: "flex", gap: 4 }}>
                  <Btn variant="ghost" onClick={() => { setEditingGoal(g); setShowGoalForm(true); }}><Edit2 size={13} /></Btn>
                  <Btn variant="ghost" onClick={() => delGoal(g.id)}><Trash2 size={13} color={C.danger} /></Btn>
                </div>
              )}
            </div>
          );
        })}
        {showGoalForm && (
          <GoalForm
            existing={editingGoal}
            athleteId={athlete.id}
            onCancel={() => setShowGoalForm(false)}
            onSave={(g) => {
              persist((prev) => ({ ...prev, goals: editingGoal ? prev.goals.map((x) => (x.id === g.id ? g : x)) : [...(prev.goals || []), g] }));
              setShowGoalForm(false);
            }}
          />
        )}
      </Card>

      <BestTable
        title="Osobní rekordy — závod"
        pbs={pbs}
        type="race"
        canEdit={canEdit}
        onEdit={(p) => { setEditingPb(p); setShowPbForm(true); }}
      />
      <BestTable
        title="Tréninkový rekord"
        pbs={pbs}
        type="training"
        canEdit={canEdit}
        onEdit={(p) => { setEditingPb(p); setShowPbForm(true); }}
      />

      {disciplines.length > 0 && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: C.textFaint }}>Vývoj výkonu (nižší čas = lepší)</div>
            <Select value={activeDiscipline} onChange={(e) => setChartDiscipline(e.target.value)} style={{ width: 160 }}>
              {disciplines.map((d) => <option key={d} value={d}>{d}</option>)}
            </Select>
          </div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke={C.textFaint} fontSize={11} />
                <YAxis stroke={C.textFaint} fontSize={11} tickFormatter={(v) => fmtTime(v, isShortDistance(activeDiscipline))} reversed />
                <Tooltip
                  contentStyle={{ background: C.surface2, border: "1px solid " + C.border, borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: C.text }}
                  formatter={(v) => fmtTime(v, isShortDistance(activeDiscipline))}
                />
                <Line type="monotone" dataKey="seconds" stroke={C.accent} strokeWidth={2} dot={{ r: 4, fill: C.accent }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: C.textFaint, marginBottom: 10 }}>Tréninková zátěž — posledních 12 týdnů</div>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={loadData_}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
              <XAxis dataKey="label" stroke={C.textFaint} fontSize={11} />
              <YAxis stroke={C.textFaint} fontSize={11} />
              <Tooltip contentStyle={{ background: C.surface2, border: "1px solid " + C.border, borderRadius: 8, fontSize: 12 }} labelStyle={{ color: C.text }} />
              <Line type="monotone" dataKey="load" stroke={C.warn} strokeWidth={2} dot={{ r: 3, fill: C.warn }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ fontSize: 11, color: C.textFaint, marginTop: 6 }}>
          Zátěž = RPE × odhadovaná délka tréninku (min). Pomáhá vidět nárůst objemu dřív, než se projeví v únavě.
        </div>
      </Card>

      <Card>
        <div style={{ fontSize: 12, color: C.textFaint, marginBottom: 10 }}>Historie výkonů</div>
        {pbs.length === 0 && <Empty text="Žádné záznamy." />}
        {pbs.map((p) => (
          <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid " + C.border, fontSize: 13 }}>
            <div>
              <span style={{ fontWeight: 600 }}>{p.discipline}</span>{" "}
              <span style={{ fontFamily: FONT_MONO }}>{fmtTime(p.seconds, isShortDistance(p.discipline))}</span>{" "}
              <Badge bg={C.surface2} color={C.textDim}>{p.type === "race" ? "závod" : "trénink"}</Badge>{" "}
              <span style={{ color: C.textFaint }}>{fmtDateShort(p.date)}</span>
              {p.note && <div style={{ color: C.textFaint, fontSize: 12 }}>{p.note}</div>}
            </div>
            {canEdit && (
              <div style={{ display: "flex", gap: 4 }}>
                <Btn variant="ghost" onClick={() => { setEditingPb(p); setShowPbForm(true); }}><Edit2 size={13} /></Btn>
                <Btn variant="ghost" onClick={() => del(p.id)}><Trash2 size={13} color={C.danger} /></Btn>
              </div>
            )}
          </div>
        ))}
      </Card>

      {showPbForm && (
        <PbForm
          existing={editingPb}
          onCancel={() => setShowPbForm(false)}
          onSave={(pb) => {
            persist((prev) => ({
              ...prev,
              pbs: editingPb ? prev.pbs.map((x) => (x.id === pb.id ? pb : x)) : [...prev.pbs, pb],
            }));
            setShowPbForm(false);
          }}
          athleteId={athlete.id}
        />
      )}
    </div>
  );
}

function InjuryForm({ existing, onCancel, onSave, athleteId }) {
  const [description, setDescription] = useState(existing?.description || "");
  const [startDate, setStartDate] = useState(existing?.startDate || todayStr());
  const [endDate, setEndDate] = useState(existing?.endDate || "");
  const [note, setNote] = useState(existing?.note || "");

  function save() {
    if (!description.trim()) return;
    onSave({ id: existing?.id || uid(), athleteId, description: description.trim(), startDate, endDate: endDate || null, note });
  }

  return (
    <Card style={{ marginTop: 12 }}>
      <Field label="Popis (např. natažený sval, únavová zlomenina...)">
        <TextInput value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Popis zranění" />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Od"><TextInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></Field>
        <Field label="Do (prázdné = stále trvá)"><TextInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></Field>
      </div>
      <Field label="Poznámka"><TextInput value={note} onChange={(e) => setNote(e.target.value)} placeholder="volitelné" /></Field>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn onClick={onCancel}>Zrušit</Btn>
        <Btn variant="accent" onClick={save}><Check size={15} />Uložit</Btn>
      </div>
    </Card>
  );
}

function GoalForm({ existing, onCancel, onSave, athleteId }) {
  const [discipline, setDiscipline] = useState(existing?.discipline || DISCIPLINES[0]);
  const [time, setTime] = useState(existing ? fmtTime(existing.targetSeconds, isShortDistance(existing.discipline)) : "");
  const [targetDate, setTargetDate] = useState(existing?.targetDate || "");
  const [note, setNote] = useState(existing?.note || "");

  function save() {
    const seconds = parseTime(time);
    if (!seconds) return;
    onSave({ id: existing?.id || uid(), athleteId, discipline, targetSeconds: seconds, targetDate, note });
  }

  return (
    <Card style={{ marginTop: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Disciplína">
          <Select value={discipline} onChange={(e) => setDiscipline(e.target.value)}>
            {DISCIPLINES.map((d) => <option key={d} value={d}>{d}</option>)}
          </Select>
        </Field>
        <Field label={isShortDistance(discipline) ? "Cílový čas (ss.ss)" : "Cílový čas (mm:ss.ss)"}>
          <TextInput value={time} onChange={(e) => setTime(e.target.value)} placeholder={isShortDistance(discipline) ? "10.85" : "3:45.20"} style={{ fontFamily: FONT_MONO }} />
        </Field>
        <Field label="Do kdy (volitelné)"><TextInput type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} /></Field>
      </div>
      <Field label="Poznámka"><TextInput value={note} onChange={(e) => setNote(e.target.value)} placeholder="volitelné" /></Field>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn onClick={onCancel}>Zrušit</Btn>
        <Btn variant="accent" onClick={save}><Check size={15} />Uložit</Btn>
      </div>
    </Card>
  );
}

function PbForm({ existing, onCancel, onSave, athleteId }) {
  const [discipline, setDiscipline] = useState(existing?.discipline || DISCIPLINES[0]);
  const [time, setTime] = useState(existing ? fmtTime(existing.seconds, isShortDistance(existing.discipline)) : "");
  const [type, setType] = useState(existing?.type || "race");
  const [date, setDate] = useState(existing?.date || todayStr());
  const [note, setNote] = useState(existing?.note || "");

  function save() {
    const seconds = parseTime(time);
    if (!seconds) return;
    onSave({ id: existing?.id || uid(), athleteId, discipline, seconds, type, date, note });
  }

  return (
    <Card style={{ marginTop: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Disciplína">
          <Select value={discipline} onChange={(e) => setDiscipline(e.target.value)}>
            {DISCIPLINES.map((d) => <option key={d} value={d}>{d}</option>)}
          </Select>
        </Field>
        <Field label={isShortDistance(discipline) ? "Čas (ss.ss)" : "Čas (mm:ss.ss)"}><TextInput value={time} onChange={(e) => setTime(e.target.value)} placeholder={isShortDistance(discipline) ? "10.85" : "3:45.20"} style={{ fontFamily: FONT_MONO }} /></Field>
        <Field label="Typ">
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="race">Závod</option>
            <option value="training">Trénink</option>
          </Select>
        </Field>
        <Field label="Datum"><TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
      </div>
      <Field label="Poznámka"><TextInput value={note} onChange={(e) => setNote(e.target.value)} placeholder="volitelné" /></Field>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn onClick={onCancel}>Zrušit</Btn>
        <Btn variant="accent" onClick={save}><Check size={15} />Uložit</Btn>
      </div>
    </Card>
  );
}

// ---------- Atleti (coach list) ----------

function AtletiList({ data, persist, athletes }) {
  const [selected, setSelected] = useState(null);

  if (selected) {
    const a = athletes.find((x) => x.id === selected);
    return (
      <div>
        <Btn variant="ghost" onClick={() => setSelected(null)} style={{ marginBottom: 14 }}><ChevronLeft size={15} />Zpět na seznam</Btn>
        <AthleteCard data={data} persist={persist} athlete={a} canEdit={true} />
      </div>
    );
  }

  return (
    <div>
      <SectionTitle icon={Users}>Atleti</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: 12 }}>
        {athletes.map((a) => {
          const today = todayStr();
          const injured = (data.injuries || []).some((i) => i.athleteId === a.id && (!i.endDate || i.endDate >= today));
          return (
            <button key={a.id} onClick={() => setSelected(a.id)} style={{ textAlign: "left", cursor: "pointer" }}>
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 600 }}>{a.name}</div>
                  {injured && <Badge bg={C.dangerSoft} color={C.danger}>zraněn/á</Badge>}
                </div>
                <div style={{ fontSize: 12, color: C.textDim, marginTop: 3 }}>{(a.mainDisciplines || []).join(", ") || "Bez hlavní disciplíny"}</div>
              </Card>
            </button>
          );
        })}
        {athletes.length === 0 && <Empty text="Zatím žádní atleti." />}
      </div>
    </div>
  );
}

// ---------- Nastavení ----------

function PeriodForm({ existing, onCancel, onSave }) {
  const [type, setType] = useState(existing?.type || PERIOD_TYPES[0].key);
  const [name, setName] = useState(existing?.name || "");
  const [startDate, setStartDate] = useState(existing?.startDate || todayStr());
  const [endDate, setEndDate] = useState(existing?.endDate || todayStr());

  function save() {
    if (!startDate || !endDate) return;
    onSave({ id: existing?.id || uid(), type, name: name.trim(), startDate, endDate });
  }

  return (
    <Card style={{ marginTop: 12 }}>
      <Field label="Typ období">
        <Select value={type} onChange={(e) => setType(e.target.value)}>
          {PERIOD_TYPES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
        </Select>
      </Field>
      <Field label="Vlastní název (volitelné)"><TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="např. Zimní příprava" /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Od"><TextInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></Field>
        <Field label="Do"><TextInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></Field>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn onClick={onCancel}>Zrušit</Btn>
        <Btn variant="accent" onClick={save}><Check size={15} />Uložit</Btn>
      </div>
    </Card>
  );
}

function GroupForm({ existing, athletes, onCancel, onSave }) {
  const [name, setName] = useState(existing?.name || "");
  const [athleteIds, setAthleteIds] = useState(existing?.athleteIds || []);

  function toggle(id) {
    setAthleteIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function save() {
    if (!name.trim()) return;
    onSave({ id: existing?.id || uid(), name: name.trim(), athleteIds });
  }

  return (
    <Card style={{ marginTop: 12 }}>
      <Field label="Název skupiny"><TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="např. Sprinteři" /></Field>
      <Field label="Členové">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {athletes.map((a) => (
            <button
              key={a.id}
              onClick={() => toggle(a.id)}
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                border: "1px solid " + (athleteIds.includes(a.id) ? C.accent : C.border),
                background: athleteIds.includes(a.id) ? C.accentSoft : C.surface2,
                color: athleteIds.includes(a.id) ? C.accent : C.textDim,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {a.name}
            </button>
          ))}
        </div>
      </Field>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn onClick={onCancel}>Zrušit</Btn>
        <Btn variant="accent" onClick={save}><Check size={15} />Uložit</Btn>
      </div>
    </Card>
  );
}

function BackupSection({ data, persist }) {
  const fileInputRef = React.useRef(null);
  const [pending, setPending] = useState(null);
  const [error, setError] = useState("");

  function download() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `treninkovy-denik-zaloha-${todayStr()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function onFileChosen(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.users)) {
          setError("Tenhle soubor nevypadá jako platná záloha appky.");
          return;
        }
        setPending(parsed);
      } catch {
        setError("Soubor se nepodařilo přečíst — není to platný JSON.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function confirmRestore() {
    persist(() => migrate(pending));
    setPending(null);
  }

  return (
    <Card style={{ marginBottom: 20 }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, marginBottom: 6 }}>Záloha dat</div>
      <div style={{ fontSize: 12, color: C.textFaint, marginBottom: 12 }}>
        Appka ukládá data jen v tomto prostředí. Stáhni si čas od času zálohu, ať o nic nepřijdeš.
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Btn variant="accent" onClick={download}><Check size={14} />Stáhnout zálohu</Btn>
        <Btn onClick={() => fileInputRef.current?.click()}><Plus size={14} />Nahrát zálohu</Btn>
        <input ref={fileInputRef} type="file" accept="application/json" onChange={onFileChosen} style={{ display: "none" }} />
      </div>
      {error && <div style={{ color: C.danger, fontSize: 12, marginTop: 8 }}>{error}</div>}
      {pending && (
        <div style={{ marginTop: 12, background: C.dangerSoft, borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ fontSize: 13, color: C.text, marginBottom: 10 }}>
            Tohle <strong>přepíše všechna současná data</strong> v appce ({pending.users?.length || 0} uživatelů, {pending.trainings?.length || 0} tréninků). Opravdu pokračovat?
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={() => setPending(null)}>Zrušit</Btn>
            <Btn variant="danger" onClick={confirmRestore}>Ano, přepsat data</Btn>
          </div>
        </div>
      )}
    </Card>
  );
}

function Nastaveni({ data, persist, currentUser }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [disciplines, setDisciplines] = useState([]);
  const [role, setRole] = useState("athlete");
  const [editingVocId, setEditingVocId] = useState(null);
  const [vocDraft, setVocDraft] = useState("");
  const [addError, setAddError] = useState("");
  const [adding, setAdding] = useState(false);
  const [createdInfo, setCreatedInfo] = useState(null);

  function toggleDiscipline(d) {
    setDisciplines((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  }

  function generatePassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let out = "";
    for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * chars.length)];
    setPassword(out);
  }

  async function addUser() {
    setAddError("");
    if (!name.trim() || !email.trim() || !email.includes("@")) {
      setAddError("Vyplň jméno a platný e-mail.");
      return;
    }
    if (!password || password.length < 8) {
      setAddError("Heslo musí mít alespoň 8 znaků.");
      return;
    }
    setAdding(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const requesterToken = sessionData?.session?.access_token;
      const res = await fetch("/api/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, requesterToken }),
      });
      const body = await res.json();
      if (!res.ok) {
        setAddError(body.error || "Účet se nepodařilo založit.");
        setAdding(false);
        return;
      }
      const u = { id: uid(), name: name.trim(), role, email: email.trim().toLowerCase(), mainDisciplines: role === "athlete" ? disciplines : [] };
      await persist((prev) => ({ ...prev, users: [...prev.users, u] }));
      setCreatedInfo({ name: name.trim(), email: email.trim(), password });
      setName(""); setEmail(""); setPassword(""); setDisciplines([]);
    } catch (e) {
      setAddError("Nepodařilo se spojit se serverem.");
    }
    setAdding(false);
  }

  function removeUser(id) {
    if (id === currentUser.id) return;
    persist((prev) => ({ ...prev, users: prev.users.filter((u) => u.id !== id) }));
  }

  function startEditVocative(u) {
    setEditingVocId(u.id);
    setVocDraft(u.vocative || guessVocative(u.name.split(" ")[0]));
  }

  function saveVocative(id) {
    persist((prev) => ({ ...prev, users: prev.users.map((u) => (u.id === id ? { ...u, vocative: vocDraft.trim() } : u)) }));
    setEditingVocId(null);
  }

  const athletes = data.users.filter((u) => u.role === "athlete");
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  function delGroup(id) {
    persist((prev) => ({ ...prev, groups: prev.groups.filter((g) => g.id !== id) }));
  }

  const [showPeriodForm, setShowPeriodForm] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState(null);

  function delPeriod(id) {
    persist((prev) => ({ ...prev, periods: (prev.periods || []).filter((p) => p.id !== id) }));
  }

  return (
    <div>
      <SectionTitle icon={Settings}>Nastavení</SectionTitle>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, marginBottom: 12 }}>Přidat člena týmu</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Jméno"><TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Petra Svobodová" /></Field>
          <Field label="E-mail"><TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="petra@email.cz" /></Field>
          <Field label="Heslo (alespoň 8 znaků)">
            <div style={{ display: "flex", gap: 8 }}>
              <TextInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="heslo pro atleta" style={{ flex: 1 }} />
              <Btn onClick={generatePassword}>Vygenerovat</Btn>
            </div>
          </Field>
          <Field label="Role">
            <Select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="athlete">Atlet</option>
              <option value="coach">Trenér</option>
            </Select>
          </Field>
        </div>
        {role === "athlete" && (
          <Field label="Hlavní disciplíny (lze vybrat víc)">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {DISCIPLINES.map((d) => (
                <button
                  key={d}
                  onClick={() => toggleDiscipline(d)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: "1px solid " + (disciplines.includes(d) ? C.accent : C.border),
                    background: disciplines.includes(d) ? C.accentSoft : C.surface2,
                    color: disciplines.includes(d) ? C.accent : C.textDim,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </Field>
        )}
        {addError && <div style={{ color: C.danger, fontSize: 13, margin: "10px 0" }}>{addError}</div>}
        <Btn variant="accent" onClick={addUser} disabled={adding}>
          <Plus size={15} />{adding ? "Zakládám…" : "Přidat"}
        </Btn>
        {createdInfo && (
          <div style={{ marginTop: 14, background: C.successSoft, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 13, color: C.text, marginBottom: 6 }}>
              Účet pro <strong>{createdInfo.name}</strong> je hotový. Pošli mu tyhle přihlašovací údaje (jinde už je neuvidíš):
            </div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 13 }}>
              {createdInfo.email} <br /> heslo: {createdInfo.password}
            </div>
            <Btn onClick={() => setCreatedInfo(null)} style={{ marginTop: 8 }}>Zavřít</Btn>
          </div>
        )}
      </Card>

      <Card>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, marginBottom: 12 }}>Tým</div>
        {data.users.map((u) => (
          <div key={u.id} style={{ padding: "9px 0", borderBottom: "1px solid " + C.border }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontWeight: 600 }}>{u.name}</span>{" "}
                <Badge bg={C.surface2} color={C.textDim}>{u.role === "coach" ? "trenér" : (u.mainDisciplines || []).join(", ") || "atlet"}</Badge>
                {u.id === currentUser.id && <span style={{ color: C.textFaint, fontSize: 12, marginLeft: 6 }}>(ty)</span>}
                <div style={{ fontSize: 11, color: C.textFaint, marginTop: 3 }}>{u.email}</div>
                <div style={{ fontSize: 11, color: C.textFaint }}>
                  Oslovení: „Ahojda {u.vocative || guessVocative(u.name.split(" ")[0])},“
                </div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <Btn variant="ghost" onClick={() => startEditVocative(u)}><Edit2 size={14} /></Btn>
                {u.id !== currentUser.id && (
                  <Btn variant="ghost" onClick={() => removeUser(u.id)}><Trash2 size={14} color={C.danger} /></Btn>
                )}
              </div>
            </div>
            {editingVocId === u.id && (
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <TextInput value={vocDraft} onChange={(e) => setVocDraft(e.target.value)} placeholder="např. Petře" style={{ maxWidth: 200 }} />
                <Btn variant="accent" onClick={() => saveVocative(u.id)}><Check size={14} />Uložit</Btn>
                <Btn onClick={() => setEditingVocId(null)}>Zrušit</Btn>
              </div>
            )}
          </div>
        ))}
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16 }}>Skupiny atletů</div>
          <Btn onClick={() => { setEditingGroup(null); setShowGroupForm(true); }}><Plus size={14} />Nová skupina</Btn>
        </div>
        {(data.groups || []).length === 0 && <Empty text="Zatím žádné skupiny. Skupiny slouží k hromadnému přiřazování tréninků." />}
        {(data.groups || []).map((g) => (
          <div key={g.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid " + C.border }}>
            <div>
              <span style={{ fontWeight: 600 }}>{g.name}</span>{" "}
              <span style={{ fontSize: 12, color: C.textFaint }}>({(g.athleteIds || []).length} atletů)</span>
              <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>
                {athletes.filter((a) => (g.athleteIds || []).includes(a.id)).map((a) => a.name).join(", ") || "—"}
              </div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <Btn variant="ghost" onClick={() => { setEditingGroup(g); setShowGroupForm(true); }}><Edit2 size={14} /></Btn>
              <Btn variant="ghost" onClick={() => delGroup(g.id)}><Trash2 size={14} color={C.danger} /></Btn>
            </div>
          </div>
        ))}
        {showGroupForm && (
          <GroupForm
            existing={editingGroup}
            athletes={athletes}
            onCancel={() => setShowGroupForm(false)}
            onSave={(g) => {
              persist((prev) => ({ ...prev, groups: editingGroup ? prev.groups.map((x) => (x.id === g.id ? g : x)) : [...(prev.groups || []), g] }));
              setShowGroupForm(false);
            }}
          />
        )}
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16 }}>Sezónní periodizace</div>
          <Btn onClick={() => { setEditingPeriod(null); setShowPeriodForm(true); }}><Plus size={14} />Přidat období</Btn>
        </div>
        {(data.periods || []).length === 0 && <Empty text="Zatím žádná období. Vyznač si fáze sezóny (základ, rozvoj, vrchol...), uvidíš je barevně v kalendáři." />}
        {[...(data.periods || [])].sort((a, b) => a.startDate.localeCompare(b.startDate)).map((p) => {
          const meta = PERIOD_TYPES.find((pt) => pt.key === p.type);
          return (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid " + C.border }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: meta?.color || C.textFaint }} />
                <div>
                  <span style={{ fontWeight: 600 }}>{p.name || meta?.label}</span>
                  <div style={{ fontSize: 12, color: C.textFaint }}>{fmtDateShort(p.startDate)} – {fmtDateShort(p.endDate)}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <Btn variant="ghost" onClick={() => { setEditingPeriod(p); setShowPeriodForm(true); }}><Edit2 size={14} /></Btn>
                <Btn variant="ghost" onClick={() => delPeriod(p.id)}><Trash2 size={14} color={C.danger} /></Btn>
              </div>
            </div>
          );
        })}
        {showPeriodForm && (
          <PeriodForm
            existing={editingPeriod}
            onCancel={() => setShowPeriodForm(false)}
            onSave={(p) => {
              persist((prev) => ({ ...prev, periods: editingPeriod ? prev.periods.map((x) => (x.id === p.id ? p : x)) : [...(prev.periods || []), p] }));
              setShowPeriodForm(false);
            }}
          />
        )}
      </Card>

      <BackupSection data={data} persist={persist} />

      <div style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "flex-start", color: C.textFaint, fontSize: 12 }}>
        <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>Účty se zakládají jen tady v appce a přihlašuje se e-mailem a heslem, které jsi zadal/a. Hesla si appka nikam neukládá — zvol si silné heslo a nikomu ho neposílej přes veřejné kanály.</span>
      </div>
    </div>
  );
}
