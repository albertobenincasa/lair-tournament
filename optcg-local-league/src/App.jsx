import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Anchor,
  ChevronDown,
  ChevronUp,
  Compass,
  Medal,
  Swords,
  Trophy,
  Waves,
} from "lucide-react";
import { leagueMeta } from "./data/mockLeagueData";
import logoNewml from "../logo-newml.png";
import leaderCatalogData from "../leader_catalog.json";

const tabs = [
  { key: "rankings", label: "Rankings", icon: Trophy },
  { key: "decks", label: "Decks", icon: Swords },
  { key: "league-info", label: "League Info", icon: Waves },
];

const LEAGUE_ROUND_CALENDAR = [
  "01/04",
  "08/04",
  "15/04",
  "22/04",
  "29/04",
  "06/05",
  "13/05",
  "20/05",
  "27/05 - la top 8 potente",
];

const medalColors = [
  "text-yellow-300 drop-shadow-[0_0_6px_rgba(250,204,21,0.75)]",
  "text-cyan-200 drop-shadow-[0_0_6px_rgba(125,211,252,0.65)]",
  "text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.65)]",
];

const optcgColorHex = {
  purple: "#a855f7",
  blue: "#3b82f6",
  black: "#111827",
  yellow: "#facc15",
  green: "#22c55e",
  red: "#ef4444",
};

const OPTCG_COLOR_KEYS = ["purple", "blue", "black", "yellow", "green", "red"];
const NETLIFY_FUNCTIONS_BASE = "/.netlify/functions";

const LEADER_CATALOG = {};

const DEG2RAD = Math.PI / 180;
const ADMIN_CODE_HASH = "9bd740c6731bfb452d59a2a4998f28fac87dba1e4371a63d68d1bfb0aa0871cc";

async function sha256Hex(value) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function polarToCartesian(cx, cy, radius, angleDeg) {
  const radians = (angleDeg - 90) * DEG2RAD;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function buildDonutPath({ cx, cy, innerRadius, outerRadius, startAngle, endAngle, explode = 0 }) {
  const midAngle = (startAngle + endAngle) / 2;
  const explodeRadians = (midAngle - 90) * DEG2RAD;
  const shiftX = Math.cos(explodeRadians) * explode;
  const shiftY = Math.sin(explodeRadians) * explode;
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  const outerStart = polarToCartesian(cx + shiftX, cy + shiftY, outerRadius, startAngle);
  const outerEnd = polarToCartesian(cx + shiftX, cy + shiftY, outerRadius, endAngle);
  const innerStart = polarToCartesian(cx + shiftX, cy + shiftY, innerRadius, startAngle);
  const innerEnd = polarToCartesian(cx + shiftX, cy + shiftY, innerRadius, endAngle);

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current.trim());
  return result;
}

function parseCsvRows(content) {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce((acc, header, index) => {
      acc[header] = values[index] ?? "";
      return acc;
    }, {});
  });
}

function normalizeHeaderToken(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function toNormalizedCsvRow(row) {
  const normalized = {};
  Object.entries(row).forEach(([key, value]) => {
    normalized[normalizeHeaderToken(key)] = String(value ?? "").trim();
  });
  return normalized;
}

function getCsvField(normalizedRow, aliases) {
  for (const alias of aliases) {
    const value = normalizedRow[normalizeHeaderToken(alias)];
    if (value) return value;
  }
  return "";
}

function isLikelyBandaiId(value) {
  const trimmed = String(value ?? "").trim();
  return /^\d{6,}$/.test(trimmed);
}

function hasLetters(value) {
  return /[a-z]/i.test(String(value ?? ""));
}

function buildInitialEntries() {
  return [];
}

function buildInitialRoundColumns() {
  return [];
}

function hashString(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function normalizeLeaderCode(code) {
  return String(code ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/_/g, "-");
}

function buildLeaderCodeCandidates(code) {
  const normalized = normalizeLeaderCode(code);
  if (!normalized) return [];

  const base = new Set([
    normalized,
    normalized.replace(/-/g, ""),
  ]);

  if (normalized.startsWith("EB04-")) {
    const suffix = normalized.slice("EB04-".length);
    base.add(`OP14-${suffix}`);
    base.add(`OP14${suffix}`);
  }

  if (normalized.startsWith("OP15-")) {
    const suffix = normalized.slice("OP15-".length);
    base.add(`OP14-${suffix}`);
    base.add(`OP14${suffix}`);
  }

  return [...base];
}

function buildLeaderCatalog(records) {
  if (!Array.isArray(records)) return {};
  const nextCatalog = {};

  records.forEach((item) => {
    const colorTokens = String(item.card_color ?? "")
      .split(/[\s/,&-]+/)
      .map((value) => value.trim().toLowerCase())
      .filter((value) => OPTCG_COLOR_KEYS.includes(value));

    const colors = colorTokens.length ? colorTokens : ["blue"];
    const meta = {
      name: item.card_name || item.card_set_id || item.card_image_id || "Unknown Leader",
      colors,
      image: item.card_image || null,
    };

    const keys = new Set(
      [
        item.card_set_id,
        item.card_image_id,
        String(item.card_image_id ?? "").replace(/_P\d+$/i, ""),
      ]
        .map(normalizeLeaderCode)
        .filter(Boolean)
    );

    keys.forEach((key) => {
      if (!nextCatalog[key]) nextCatalog[key] = meta;
      if (!nextCatalog[key.replace(/-/g, "")]) nextCatalog[key.replace(/-/g, "")] = meta;
    });

    // Compatibility aliases for local CSV formats (EB04/OP15 -> OP14 codes).
    const setCode = normalizeLeaderCode(item.card_set_id);
    if (setCode.startsWith("OP14-")) {
      const suffix = setCode.slice("OP14-".length);
      const ebAlias = `EB04-${suffix}`;
      const op15Alias = `OP15-${suffix}`;
      if (!nextCatalog[ebAlias]) nextCatalog[ebAlias] = meta;
      if (!nextCatalog[op15Alias]) nextCatalog[op15Alias] = meta;
    }
  });

  return nextCatalog;
}

const LOCAL_LEADER_CATALOG = buildLeaderCatalog(leaderCatalogData);

function getLeaderMeta(leaderCode, apiLeaderCatalog = {}) {
  const candidates = buildLeaderCodeCandidates(leaderCode);
  if (candidates.length === 0) return null;

  for (const key of candidates) {
    if (apiLeaderCatalog[key]) return { code: normalizeLeaderCode(leaderCode), ...apiLeaderCatalog[key] };
  }
  for (const key of candidates) {
    if (LEADER_CATALOG[key]) return { code: normalizeLeaderCode(leaderCode), ...LEADER_CATALOG[key] };
  }

  const normalized = normalizeLeaderCode(leaderCode);
  const idx = hashString(normalized) % OPTCG_COLOR_KEYS.length;
  return {
    code: normalized,
    name: normalized,
    colors: [OPTCG_COLOR_KEYS[idx]],
    image: `https://api.dicebear.com/8.x/shapes/svg?seed=${encodeURIComponent(normalized)}`,
  };
}

function formatRatioValue(value) {
  if (Number.isInteger(value)) return `${value}`;
  return value.toFixed(1);
}

function normalizeSharedState(payload) {
  const safeEntries = Array.isArray(payload?.leaderboardEntries) ? payload.leaderboardEntries : buildInitialEntries();
  const safeRounds = Array.isArray(payload?.roundColumns) ? payload.roundColumns : buildInitialRoundColumns();
  const safeLink = typeof payload?.nextEventLink === "string" ? payload.nextEventLink : "";
  return {
    leaderboardEntries: safeEntries,
    roundColumns: safeRounds,
    nextEventLink: safeLink,
  };
}

async function fetchLeagueState() {
  const response = await fetch(`${NETLIFY_FUNCTIONS_BASE}/get-league-state`);
  if (!response.ok) throw new Error("load_failed");
  const payload = await response.json();
  return payload?.state ? normalizeSharedState(payload.state) : null;
}

async function saveLeagueState(nextState) {
  const state = normalizeSharedState(nextState);
  const response = await fetch(`${NETLIFY_FUNCTIONS_BASE}/set-league-state`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state }),
  });
  if (!response.ok) throw new Error("save_failed");
  return state;
}

function applyLeagueStateToUi(state, setters) {
  setters.setLeaderboardEntries(state.leaderboardEntries);
  setters.setRoundColumns(state.roundColumns);
  setters.setNextEventLink(state.nextEventLink);
  setters.setNextEventLinkInput(state.nextEventLink);
}

async function loadSharedStateToUi(setters, { silent = false } = {}) {
  try {
    const fetchedState = await fetchLeagueState();
    if (fetchedState) {
      applyLeagueStateToUi(fetchedState, setters);
      if (!silent) setters.setUploadStatus("Shared league loaded.");
      return true;
    }

    const emptyState = normalizeSharedState({});
    await saveLeagueState(emptyState);
    applyLeagueStateToUi(emptyState, setters);
    if (!silent) setters.setUploadStatus("Shared league ready.");
    return true;
  } catch {
    if (!silent) setters.setUploadStatus("Unable to load shared league data from Netlify.");
    return false;
  }
}

async function persistSharedState(setters, nextState, successMessage) {
  try {
    const savedState = await saveLeagueState(nextState);
    applyLeagueStateToUi(savedState, setters);
    if (successMessage) setters.setUploadStatus(successMessage);
    return true;
  } catch {
    setters.setUploadStatus("Unable to sync shared league data to Netlify.");
    return false;
  }
}

function SortHeader({ label, sortKey, sortConfig, onSort, className = "" }) {
  const active = sortConfig.key === sortKey;
  const Icon = active && sortConfig.direction === "asc" ? ChevronUp : ChevronDown;

  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={`group inline-flex items-center gap-1 text-left text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:text-amber-700 ${className}`}
    >
      <span>{label}</span>
      <Icon
        className={`h-4 w-4 transition ${
          active ? "opacity-100" : "opacity-35 group-hover:opacity-70"
        }`}
      />
    </button>
  );
}

function RankingsSection({ data, roundColumns, sortConfig, onSort }) {
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-[#d4b47d] bg-gradient-to-br from-[#f3e7cc] via-[#ecdcb9] to-[#e5d3ad] shadow-[0_14px_35px_rgba(2,6,23,0.25)]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#d7c49b]">
          <thead className="bg-[#e8d7b2]">
            <tr>
              <th className="px-4 py-3 text-left">
                <SortHeader label="Position" sortKey="position" sortConfig={sortConfig} onSort={onSort} />
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader label="Bandai ID" sortKey="memberNumber" sortConfig={sortConfig} onSort={onSort} />
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader label="Player" sortKey="name" sortConfig={sortConfig} onSort={onSort} />
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader label="Points" sortKey="points" sortConfig={sortConfig} onSort={onSort} />
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader label="Wins" sortKey="wins" sortConfig={sortConfig} onSort={onSort} />
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader label="Losses" sortKey="losses" sortConfig={sortConfig} onSort={onSort} />
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader label="Win Rate" sortKey="winRate" sortConfig={sortConfig} onSort={onSort} />
              </th>
              {roundColumns.map((roundNumber) => (
                <th key={`round-col-${roundNumber}`} className="px-3 py-3 text-left">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    R{roundNumber}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d7c49b]">
            {data.map((entry) => {
              const isTop3 = entry.position <= 3;
              return (
                <tr
                  key={entry.playerId}
                  className={`transition ${
                    isTop3
                      ? "bg-gradient-to-r from-amber-200/80 via-yellow-100/70 to-orange-100/70"
                      : "hover:bg-amber-100/70"
                  }`}
                >
                  <td className="px-4 py-3 text-sm text-slate-800">
                    <div className="flex items-center gap-2">
                      {entry.position <= 3 ? (
                        <Medal className={`h-4 w-4 ${medalColors[entry.position - 1]}`} />
                      ) : null}
                      <span>{entry.position}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-900">{entry.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-800">{entry.memberNumber || "-"}</td>
                  <td className="px-4 py-3 text-sm font-bold text-amber-700">{entry.points}</td>
                  <td className="px-4 py-3 text-sm text-emerald-800">{formatRatioValue(entry.wins)}</td>
                  <td className="px-4 py-3 text-sm text-rose-800">{formatRatioValue(entry.losses)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-sky-900">{entry.winRate}%</td>
                  {roundColumns.map((roundNumber) => {
                    const roundResult = entry.roundResults[roundNumber];
                    return (
                      <td key={`${entry.playerId}-r${roundNumber}`} className="px-3 py-3 text-sm text-slate-800">
                        <span className="rounded-md border border-[#cab07f] bg-[#efe2c6] px-2 py-1 text-xs">
                          {roundResult?.played ? `${roundResult.wins}-${roundResult.losses}` : "0"}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RoundDeckPieChart({ entries }) {
  const [hoveredTooltip, setHoveredTooltip] = useState(null);
  const total = entries.reduce((sum, entry) => sum + entry.count, 0);
  let runningPct = 0;

  const segments = entries.map((entry, index) => {
    const palette = entry.colors?.length ? entry.colors : ["blue"];
    const slicePct = total === 0 ? 0 : (entry.count / total) * 100;
    const start = runningPct;
    const end = runningPct + slicePct;
    runningPct = end;
    return {
      ...entry,
      palette,
      percentage: slicePct,
      colorLabel: palette.join(" / "),
      segmentIndex: index,
      startAngle: -90 + start * 3.6,
      endAngle: -90 + end * 3.6,
    };
  });

  const chartConfig = {
    viewBox: 320,
    center: 160,
    outerRadius: 118,
    innerRadius: 68,
    explode: 6,
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-[260px_1fr] md:items-center">
      <div className="relative mx-auto">
        <motion.svg
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35 }}
          viewBox={`0 0 ${chartConfig.viewBox} ${chartConfig.viewBox}`}
          className="h-64 w-64"
        >
          <circle
            cx={chartConfig.center}
            cy={chartConfig.center}
            r={chartConfig.outerRadius + 10}
            fill="none"
            stroke="rgba(125,211,252,0.18)"
            strokeWidth="1.5"
          />

          {segments.map((segment) => {
            const segmentKey = `${segment.leader}-${segment.segmentIndex}`;
            const isHovered = hoveredTooltip?.key === segmentKey;
            const paletteColors = segment.palette.map((colorName) => optcgColorHex[colorName] ?? optcgColorHex.blue);
            const arcSpan = segment.endAngle - segment.startAngle;
            const splitAngle = segment.startAngle + arcSpan / 2;
            const subSlices =
              paletteColors.length === 2
                ? [
                    { startAngle: segment.startAngle, endAngle: splitAngle, color: paletteColors[0] },
                    { startAngle: splitAngle, endAngle: segment.endAngle, color: paletteColors[1] },
                  ]
                : [{ startAngle: segment.startAngle, endAngle: segment.endAngle, color: paletteColors[0] }];

            return (
              <g
                key={segmentKey}
                onMouseEnter={(event) =>
                  setHoveredTooltip({
                    key: segmentKey,
                    segment,
                    x: event.clientX,
                    y: event.clientY,
                  })
                }
                onMouseMove={(event) =>
                  setHoveredTooltip({
                    key: segmentKey,
                    segment,
                    x: event.clientX,
                    y: event.clientY,
                  })
                }
                onMouseLeave={() => setHoveredTooltip(null)}
              >
                {subSlices.map((subSlice, subIndex) => (
                  <path
                    key={`${segmentKey}-${subIndex}`}
                    d={buildDonutPath({
                      cx: chartConfig.center,
                      cy: chartConfig.center,
                      innerRadius: chartConfig.innerRadius,
                      outerRadius: chartConfig.outerRadius,
                      startAngle: subSlice.startAngle + 0.6,
                      endAngle: subSlice.endAngle - 0.6,
                      explode: chartConfig.explode,
                    })}
                    fill={subSlice.color}
                    stroke={isHovered ? "rgba(255,255,255,0.95)" : "rgba(15,23,42,0.8)"}
                    strokeWidth={isHovered ? "2.5" : "1.5"}
                  />
                ))}

                {segment.percentage >= 8 ? (
                  <text
                    x={
                      polarToCartesian(
                        chartConfig.center,
                        chartConfig.center,
                        (chartConfig.outerRadius + chartConfig.innerRadius) / 2 + 7,
                        (segment.startAngle + segment.endAngle) / 2
                      ).x
                    }
                    y={
                      polarToCartesian(
                        chartConfig.center,
                        chartConfig.center,
                        (chartConfig.outerRadius + chartConfig.innerRadius) / 2 + 7,
                        (segment.startAngle + segment.endAngle) / 2
                      ).y
                    }
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="700"
                    style={{
                      paintOrder: "stroke",
                      stroke: "rgba(2,6,23,0.9)",
                      strokeWidth: "2.5px",
                    }}
                  >
                    {Math.round(segment.percentage)}%
                  </text>
                ) : null}
              </g>
            );
          })}

          <circle
            cx={chartConfig.center}
            cy={chartConfig.center}
            r={chartConfig.innerRadius - 1}
            fill="rgba(2,6,23,0.96)"
            stroke="rgba(56,189,248,0.35)"
            strokeWidth="1.5"
          />
          <text
            x={chartConfig.center}
            y={chartConfig.center - 6}
            textAnchor="middle"
            fill="rgba(191,219,254,0.8)"
            fontSize="10"
            style={{ letterSpacing: "0.06em" }}
          >
            TOTAL DECKS
          </text>
          <text
            x={chartConfig.center}
            y={chartConfig.center + 16}
            textAnchor="middle"
            fill="#fde68a"
            fontWeight="700"
            fontSize="24"
          >
            {total}
          </text>
        </motion.svg>
      </div>

      <div className="space-y-2">
        {segments.map((segment) => (
          <div
            key={`${segment.leader}-${segment.segmentIndex}`}
            className="grid grid-cols-[64px_1fr_52px_56px] items-center gap-2 rounded-lg border border-blue-300/15 bg-blue-950/35 px-3 py-2"
          >
            <span className="flex items-center gap-1">
              {segment.image ? (
                <img
                  src={segment.image}
                  alt={segment.leader}
                  className="h-7 w-7 rounded-md border border-white/25 object-cover"
                  loading="lazy"
                />
              ) : null}
              <span className="flex items-center gap-1">
                {segment.palette.map((colorName) => (
                  <span
                    key={`${segment.leader}-${colorName}`}
                    className="h-3.5 w-3.5 rounded-sm border border-white/35"
                    style={{ backgroundColor: optcgColorHex[colorName] ?? optcgColorHex.blue }}
                  />
                ))}
              </span>
            </span>
            <span className="truncate text-sm text-blue-100">
              {segment.leader}
              <span className="ml-2 text-xs text-blue-100/60">
                {segment.code ? `(${segment.code}) ` : ""}
                {segment.colorLabel}
              </span>
            </span>
            <span className="text-right text-sm font-semibold text-yellow-200">{segment.count}</span>
            <span className="text-right text-xs text-cyan-100/85">{Math.round(segment.percentage)}%</span>
          </div>
        ))}
      </div>
      </div>

      {hoveredTooltip ? (
        <div
          className="pointer-events-none fixed z-[70] min-w-[18rem] max-w-[24rem] rounded-xl border border-cyan-200/30 bg-slate-900/95 px-4 py-3 shadow-[0_12px_30px_rgba(2,6,23,0.55)] backdrop-blur-sm"
          style={{
            left: `${hoveredTooltip.x + 18}px`,
            top: `${hoveredTooltip.y + 18}px`,
          }}
        >
          <div className="flex items-start gap-3">
            {hoveredTooltip.segment.image ? (
              <img
                src={hoveredTooltip.segment.image}
                alt={hoveredTooltip.segment.leader}
                className="h-16 w-16 shrink-0 rounded-lg border border-white/25 object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-slate-800 text-[11px] text-slate-300">
                No image
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-2xl font-semibold leading-tight text-slate-100">
                {hoveredTooltip.segment.leader}
              </p>
              <p className="mt-1 text-sm text-slate-300">
                Decklists: {hoveredTooltip.segment.count} ({Math.round(hoveredTooltip.segment.percentage)}%)
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function DecksSection({ roundDeckData }) {
  const [openRounds, setOpenRounds] = useState(new Set());

  function toggleRound(roundNumber, hasEntries) {
    if (!hasEntries) return;
    setOpenRounds((current) => {
      const next = new Set(current);
      if (next.has(roundNumber)) {
        next.delete(roundNumber);
      } else {
        next.add(roundNumber);
      }
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {roundDeckData.map((roundData) => {
        const totalDecks = roundData.entries.reduce((acc, entry) => acc + entry.count, 0);
        const hasEntries = roundData.entries.length > 0;
        const isOpen = openRounds.has(roundData.round) || (roundDeckData.length === 1 && hasEntries);
        return (
          <motion.article
            key={`round-${roundData.round}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-cyan-200/30 bg-gradient-to-br from-blue-900/65 via-sky-950/70 to-indigo-900/65 p-4 shadow-[0_10px_30px_rgba(34,211,238,0.2)]"
          >
            <button
              type="button"
              onClick={() => toggleRound(roundData.round, hasEntries)}
              className="mb-2 flex w-full items-center justify-between gap-3 rounded-xl border border-blue-300/20 bg-blue-950/35 px-3 py-2 text-left transition hover:border-cyan-300/45"
            >
              <div>
                <h3 className="text-lg font-semibold text-white">Round {roundData.round}</h3>
                <p className="text-xs text-blue-100/75">{hasEntries ? `${totalDecks} decks logged` : "No leader data uploaded yet"}</p>
              </div>
              <span className="inline-flex items-center gap-2 text-sm font-medium text-cyan-100">
                {hasEntries ? (isOpen ? "Collapse" : "Expand") : "Empty"}
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  key={`round-content-${roundData.round}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <RoundDeckPieChart entries={roundData.entries} />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.article>
        );
      })}
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("rankings");
  const [sortConfig, setSortConfig] = useState({ key: "points", direction: "desc" });
  const [leaderboardEntries, setLeaderboardEntries] = useState(buildInitialEntries);
  const [roundColumns, setRoundColumns] = useState(buildInitialRoundColumns);
  const [isUploadUnlocked, setIsUploadUnlocked] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [nextEventLink, setNextEventLink] = useState("");
  const [nextEventLinkInput, setNextEventLinkInput] = useState("");
  const sharedSetters = {
    setLeaderboardEntries,
    setRoundColumns,
    setNextEventLink,
    setNextEventLinkInput,
    setUploadStatus,
  };

  useEffect(() => {
    document.title = "Magic Lair League";
  }, []);

  useEffect(() => {
    if (activeTab === "admin" && !isUploadUnlocked) {
      setActiveTab("rankings");
      setUploadStatus("Admin tab is locked.");
    }
  }, [activeTab, isUploadUnlocked]);

  useEffect(() => {
    void loadSharedStateToUi(sharedSetters, { silent: false });
  }, []);

  const mergedRankings = useMemo(() => {
    return leaderboardEntries.map((entry) => {
      const roundResults = {};
      let totalPoints = 0;
      let totalWins = 0;
      let totalLosses = 0;

      roundColumns.forEach((roundNumber) => {
        const result = entry.roundResults[roundNumber];
        if (result?.played) {
          roundResults[roundNumber] = result;
          totalWins += result.wins;
          totalLosses += result.losses;
          totalPoints += result.wins * 3;
        }
      });

      const wins = totalWins;
      const losses = totalLosses;
      const totalMatches = wins + losses;
      const winRate = totalMatches === 0 ? 0 : Math.round((wins / totalMatches) * 100);

      return {
        playerId: entry.key,
        name: entry.name,
        memberNumber: entry.memberNumber ?? "",
        points: totalPoints,
        wins,
        losses,
        winRate,
        roundResults,
      };
    });
  }, [leaderboardEntries, roundColumns]);

  const rankingsWithPosition = useMemo(() => {
    return [...mergedRankings]
      .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name))
      .map((entry, index) => ({
        ...entry,
        position: index + 1,
      }));
  }, [mergedRankings]);

  const sortedRankings = useMemo(() => {
    const sorted = [...rankingsWithPosition].sort((a, b) => {
      const { key, direction } = sortConfig;
      const order = direction === "asc" ? 1 : -1;

      const valueA = a[key];
      const valueB = b[key];

      if (typeof valueA === "string" && typeof valueB === "string") {
        return valueA.localeCompare(valueB) * order;
      }

      return (valueA - valueB) * order;
    });

    return sorted;
  }, [rankingsWithPosition, sortConfig]);

  const roundDeckData = useMemo(() => {
    return roundColumns.map((roundNumber) => {
      const usage = new Map();

      leaderboardEntries.forEach((entry) => {
        const result = entry.roundResults?.[roundNumber];
        if (!result?.played) return;
        const leaderCode = (entry.roundLeaders?.[roundNumber] ?? "").trim().toUpperCase();
        if (!leaderCode) return;
        usage.set(leaderCode, (usage.get(leaderCode) ?? 0) + 1);
      });

      const entries = [...usage.entries()]
        .map(([leaderCode, count]) => {
          const meta = getLeaderMeta(leaderCode, LOCAL_LEADER_CATALOG);
          return {
            code: leaderCode,
            leader: meta?.name ?? leaderCode,
            count,
            colors: meta?.colors ?? ["blue"],
            image: meta?.image ?? null,
          };
        })
        .sort((a, b) => b.count - a.count || a.leader.localeCompare(b.leader));

      return { round: roundNumber, entries };
    });
  }, [leaderboardEntries, roundColumns]);

  const summaryStats = [
    { label: "Players", value: leaderboardEntries.length },
    { label: "Rounds", value: roundColumns.length },
    { label: "Format", value: "League" },
  ];

  function handleSort(key) {
    setSortConfig((current) => {
      if (current.key === key) {
        return { key, direction: current.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "desc" };
    });
  }

  async function verifyAdminCode(rawCode) {
    const code = String(rawCode ?? "")
      .normalize("NFKC")
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .trim();
    if (!code) {
      setUploadStatus("Enter admin code.");
      return false;
    }

    try {
      const codeHash = await sha256Hex(code);
      if (codeHash === ADMIN_CODE_HASH) {
        setIsUploadUnlocked(true);
        setUploadStatus("Uploader unlocked.");
        return true;
      }
      setUploadStatus("baco ci hai provato");
      window.alert("baco ci hai provato");
      return false;
    } catch {
      setUploadStatus("Unable to verify admin code on this browser.");
      return false;
    }
  }

  async function promptAdminUnlock() {
    const code = window.prompt("Insert admin code to open Admin panel:");
    if (code === null) {
      setUploadStatus("Admin unlock cancelled.");
      return false;
    }
    return verifyAdminCode(code);
  }

  async function handleTabClick(tabKey) {
    if (tabKey !== "admin") {
      setActiveTab(tabKey);
      return;
    }
    if (isUploadUnlocked) {
      setActiveTab("admin");
      return;
    }
    const isUnlocked = await promptAdminUnlock();
    if (isUnlocked) setActiveTab("admin");
  }

  async function handleCsvUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const rows = parseCsvRows(text);
      if (rows.length === 0) {
        setUploadStatus("CSV has no valid rows.");
        return;
      }

      const nextRound = (roundColumns[roundColumns.length - 1] ?? 0) + 1;
      const nextEntries = leaderboardEntries.map((entry) => ({
        ...entry,
        roundResults: { ...entry.roundResults },
        roundLeaders: { ...entry.roundLeaders },
      }));

      const byMember = new Map();
      const byName = new Map();
      nextEntries.forEach((entry) => {
        if (entry.memberNumber) byMember.set(entry.memberNumber, entry);
        byName.set(entry.name.trim().toLowerCase(), entry);
      });

      rows.forEach((row) => {
        const normalizedRow = toNormalizedCsvRow(row);
        let rawName = getCsvField(normalizedRow, ["name", "player name", "player", "nickname"]);
        let memberNumber = getCsvField(normalizedRow, ["member number", "bandai id", "bandaiid", "id"]);

        if (isLikelyBandaiId(rawName) && hasLetters(memberNumber)) {
          [rawName, memberNumber] = [memberNumber, rawName];
        }

        if (!rawName) return;

        const parsedPoints = Number.parseInt(
          getCsvField(normalizedRow, ["points", "point", "score"]).replace(/[^\d-]/g, "") || "0",
          10
        );
        const points = Number.isNaN(parsedPoints) ? 0 : parsedPoints;
        const normalizedName = rawName.toLowerCase();

        let existing = memberNumber ? byMember.get(memberNumber) : undefined;
        if (!existing) existing = byName.get(normalizedName);

        if (!existing) {
          existing = {
            key: memberNumber ? `member:${memberNumber}` : `name:${normalizedName}`,
            memberNumber,
            name: rawName,
            roundResults: {},
            roundLeaders: {},
          };
          nextEntries.push(existing);
        }

        existing.name = rawName;
        if (memberNumber) {
          existing.memberNumber = memberNumber;
          existing.key = `member:${memberNumber}`;
        }
        const wins = Math.max(0, Math.min(5, Math.round(points / 3)));
        const losses = 5 - wins;
        existing.roundResults[nextRound] = { wins, losses, played: true };
        const leaderCode = getCsvField(normalizedRow, ["leader", "leader code", "leadercode"]).toUpperCase();
        existing.roundLeaders[nextRound] = leaderCode;
      });

      await persistSharedState(
        sharedSetters,
        {
          leaderboardEntries: nextEntries,
          roundColumns: [...roundColumns, nextRound],
          nextEventLink,
        },
        `Round ${nextRound} uploaded successfully (${rows.length} rows).`
      );
      event.target.value = "";
    } catch {
      setUploadStatus("Unable to process CSV file.");
    }
  }

  async function clearAllLeaderboardData() {
    await persistSharedState(
      sharedSetters,
      {
        leaderboardEntries: [],
        roundColumns: [],
        nextEventLink,
      },
      "All leaderboard data cleared."
    );
  }

  async function saveNextEventLink() {
    const raw = nextEventLinkInput.trim();
    if (!raw) {
      setUploadStatus("Insert a valid event link.");
      return;
    }
    const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    await persistSharedState(
      sharedSetters,
      {
        leaderboardEntries,
        roundColumns,
        nextEventLink: normalized,
      },
      "Next event link updated."
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(160deg,#07193f_0%,#12377f_42%,#0a2152_100%)] text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[url('/757b6491-9ff3-458c-aa4c-e37f11de8903.png')] bg-cover bg-center opacity-34 mix-blend-screen" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(251,191,36,0.24),transparent_36%),radial-gradient(circle_at_84%_10%,rgba(248,113,113,0.2),transparent_32%),radial-gradient(circle_at_50%_92%,rgba(56,189,248,0.2),transparent_35%)]" />
        <div className="absolute -left-16 top-20 h-72 w-72 rounded-full bg-cyan-300/28 blur-3xl" />
        <div className="absolute right-4 top-10 h-80 w-80 rounded-full bg-amber-300/22 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-red-300/18 blur-3xl" />
        <div className="absolute inset-0 opacity-18 [background-image:linear-gradient(to_right,transparent_0,transparent_47%,rgba(255,255,255,0.16)_50%,transparent_53%),linear-gradient(to_bottom,transparent_0,transparent_47%,rgba(255,255,255,0.16)_50%,transparent_53%)] [background-size:30px_30px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.42)_78%,rgba(2,6,23,0.68)_100%)]" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="relative mb-8 rounded-3xl border border-amber-200/45 bg-[linear-gradient(120deg,rgba(44,77,152,0.9)_0%,rgba(57,104,168,0.86)_38%,rgba(178,126,53,0.72)_72%,rgba(39,89,150,0.88)_100%)] p-6 pb-20 shadow-[0_22px_55px_rgba(2,6,23,0.4)] backdrop-blur-[1px]">
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-5">
              <img src={logoNewml} alt="League logo" className="h-28 w-28 shrink-0 object-contain" />
              <div>
                <h1 className="bg-gradient-to-r from-yellow-100 via-amber-100 to-orange-100 bg-clip-text text-4xl font-black tracking-tight text-transparent md:text-5xl">
                {leagueMeta.leagueName}
                </h1>
                <p className="mt-2 text-sm text-cyan-50/95 md:text-base">{leagueMeta.subtitle}</p>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-200/30 bg-blue-950/35 px-3 py-1 text-xs text-amber-100/90">
                  <Anchor className="h-3.5 w-3.5" />
                  <span>Grand Line Weekly Tournament</span>
                  <Waves className="h-3.5 w-3.5" />
                </div>
                <div className="mt-4 grid w-full max-w-md grid-cols-3 gap-2">
                  {summaryStats.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-amber-200/30 bg-gradient-to-b from-blue-700/45 to-blue-950/55 px-3 py-2 backdrop-blur-sm"
                    >
                      <p className="text-[10px] uppercase tracking-wider text-cyan-100/85">{item.label}</p>
                      <p className="text-2xl font-extrabold text-amber-100">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <nav className="absolute bottom-4 right-4 flex items-center gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleTabClick(tab.key)}
                  className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition sm:px-4 sm:text-sm ${
                    isActive
                      ? "border-amber-200/80 bg-gradient-to-r from-red-500/35 to-amber-400/30 text-amber-100 shadow-[0_0_0_1px_rgba(253,224,71,0.45)]"
                      : "border-blue-300/20 bg-blue-950/65 text-blue-100/80 hover:border-amber-200/50 hover:text-amber-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
          <button
            type="button"
            onClick={() => handleTabClick("admin")}
            className={`absolute right-4 top-4 inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "admin"
                ? "border-amber-200/80 bg-gradient-to-r from-red-500/35 to-amber-400/30 text-amber-100 shadow-[0_0_0_1px_rgba(253,224,71,0.45)]"
                : "border-blue-300/20 bg-blue-950/65 text-blue-100/80 hover:border-amber-200/50 hover:text-amber-100"
            }`}
          >
            <Anchor className="h-3.5 w-3.5" />
            Admin
          </button>
        </header>
        <div className="mb-8 h-2 rounded-full bg-[repeating-linear-gradient(90deg,#ca293f_0_14px,#efd492_14px_28px,#2d75b6_28px_42px)]" />
        {nextEventLink ? (
          <div className="mb-6 rounded-xl border border-amber-200/40 bg-blue-950/55 px-4 py-3 text-sm text-amber-100">
            <a href={nextEventLink} target="_blank" rel="noreferrer" className="transition hover:text-yellow-200 hover:underline">
              Register to the next event: {nextEventLink}
            </a>
          </div>
        ) : null}

        <AnimatePresence mode="wait">
          {activeTab === "rankings" ? (
            <motion.section
              key="rankings"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
            >
              <div className="mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-300" />
                <h2 className="text-xl font-semibold text-white">Full Crew Standings</h2>
              </div>
              <RankingsSection
                data={sortedRankings}
                roundColumns={roundColumns}
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </motion.section>
          ) : null}

          {activeTab === "decks" ? (
            <motion.section
              key="decks"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
            >
              <div className="mb-4 flex items-center gap-2">
                <Compass className="h-5 w-5 text-amber-200" />
                <h2 className="text-xl font-semibold text-white">Popular Decks</h2>
              </div>
              <DecksSection roundDeckData={roundDeckData} />
            </motion.section>
          ) : null}
          {activeTab === "league-info" ? (
            <motion.section
              key="league-info"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
            >
              <div className="mb-4 flex items-center gap-2">
                <Waves className="h-5 w-5 text-amber-200" />
                <h2 className="text-xl font-semibold text-white">League Info</h2>
              </div>
              <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
                <div className="overflow-hidden rounded-2xl border border-cyan-200/30 bg-blue-950/55 p-2 shadow-[0_10px_30px_rgba(34,211,238,0.2)]">
                  <img src="/leagueinfo.jpeg" alt="League info" className="h-full w-full rounded-xl object-cover" />
                </div>
                <div className="rounded-2xl border border-amber-200/30 bg-gradient-to-br from-blue-900/65 via-sky-950/70 to-indigo-900/65 p-4">
                  <h3 className="mb-3 text-lg font-semibold text-amber-100">Round Calendar</h3>
                  <ul className="space-y-2">
                    {LEAGUE_ROUND_CALENDAR.map((roundDate, index) => (
                      <li key={roundDate} className="flex items-center justify-between rounded-lg border border-blue-200/20 bg-blue-950/35 px-3 py-2 text-sm">
                        <span className="text-cyan-100">Round {index + 1}</span>
                        <span className="font-semibold text-amber-100">{roundDate}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.section>
          ) : null}
          {activeTab === "admin" ? (
            <motion.section
              key="admin"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
            >
              <div className="mb-4 flex items-center gap-2">
                <Anchor className="h-5 w-5 text-amber-200" />
                <h2 className="text-xl font-semibold text-white">Admin Panel</h2>
              </div>
              {isUploadUnlocked && (
                <div className="rounded-xl border border-amber-200/30 bg-gradient-to-r from-blue-950/55 via-blue-900/45 to-blue-950/55 px-3 py-3 backdrop-blur-sm">
                  <div className="flex w-full flex-col gap-2">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        type="file"
                        accept=".csv,text/csv"
                        onChange={handleCsvUpload}
                        className="block w-full text-xs text-blue-100 file:mr-2 file:rounded-md file:border-0 file:bg-yellow-300 file:px-2.5 file:py-1.5 file:text-xs file:font-semibold file:text-slate-900 hover:file:bg-yellow-200 sm:w-auto"
                      />
                      <button
                        type="button"
                        onClick={clearAllLeaderboardData}
                        className="rounded-md border border-rose-300/60 bg-rose-400 px-2.5 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-rose-300"
                      >
                        Clear all (test)
                      </button>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        type="url"
                        value={nextEventLinkInput}
                        onChange={(event) => setNextEventLinkInput(event.target.value)}
                        placeholder="https://... event registration link"
                        className="w-full rounded-md border border-blue-200/25 bg-blue-950/50 px-2.5 py-1.5 text-xs text-blue-100 placeholder:text-blue-100/50"
                      />
                      <button
                        type="button"
                        onClick={saveNextEventLink}
                        className="rounded-md border border-amber-300/60 bg-amber-300 px-2.5 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-amber-200"
                      >
                        Save event link
                      </button>
                    </div>
                    <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      {uploadStatus ? <p className="text-[11px] text-blue-100/80">{uploadStatus}</p> : null}
                    </div>
                  </div>
                </div>
              )}
            </motion.section>
          ) : null}
        </AnimatePresence>
      </div>
    </main>
  );
}
