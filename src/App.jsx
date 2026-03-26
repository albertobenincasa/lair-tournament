import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Medal,
  Swords,
  Trophy,
  UserCircle2,
  Users,
} from "lucide-react";
import { decks, leagueMeta, players, rankings } from "./data/mockLeagueData";

const tabs = [
  { key: "rankings", label: "Rankings", icon: Trophy },
  { key: "decks", label: "Decks", icon: Swords },
  { key: "players", label: "Players", icon: Users },
];

const medalColors = [
  "text-yellow-300",
  "text-slate-300",
  "text-amber-600",
];

const typeBadgeStyles = {
  Aggro: "bg-rose-500/20 text-rose-300 border-rose-500/50",
  Control: "bg-sky-500/20 text-sky-300 border-sky-500/50",
  Midrange: "bg-violet-500/20 text-violet-300 border-violet-500/50",
};

function getAvatarUrl(seed) {
  return `https://api.dicebear.com/8.x/adventurer/svg?seed=${seed}&backgroundType=gradientLinear`;
}

function getPlayerById(playerId) {
  return players.find((player) => player.id === playerId);
}

function SortHeader({ label, sortKey, sortConfig, onSort, className = "" }) {
  const active = sortConfig.key === sortKey;
  const Icon = active && sortConfig.direction === "asc" ? ChevronUp : ChevronDown;

  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={`group inline-flex items-center gap-1 text-left text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:text-sky-300 ${className}`}
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

function RankingsSection({ data, sortConfig, onSort }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-sky-500/20 bg-slate-900/70 shadow-[0_14px_45px_rgba(2,6,23,0.45)] backdrop-blur-md">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800">
          <thead className="bg-slate-950/50">
            <tr>
              <th className="px-4 py-3 text-left">
                <SortHeader label="Position" sortKey="position" sortConfig={sortConfig} onSort={onSort} />
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
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {data.map((entry) => {
              const isTop3 = entry.position <= 3;
              return (
                <tr
                  key={entry.playerId}
                  className={`transition ${
                    isTop3
                      ? "bg-gradient-to-r from-yellow-500/10 via-sky-500/5 to-transparent"
                      : "hover:bg-slate-800/50"
                  }`}
                >
                  <td className="px-4 py-3 text-sm text-slate-100">
                    <div className="flex items-center gap-2">
                      {entry.position <= 3 ? (
                        <Medal className={`h-4 w-4 ${medalColors[entry.position - 1]}`} />
                      ) : null}
                      <span>{entry.position}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-white">{entry.name}</td>
                  <td className="px-4 py-3 text-sm text-sky-300">{entry.points}</td>
                  <td className="px-4 py-3 text-sm text-slate-200">{entry.wins}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{entry.losses}</td>
                  <td className="px-4 py-3 text-sm text-emerald-300">{entry.winRate}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlayersSection() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {players.map((player) => (
        <motion.article
          key={player.id}
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="group rounded-2xl border border-sky-500/20 bg-slate-900/70 p-4 shadow-[0_10px_30px_rgba(2,6,23,0.45)] backdrop-blur-md"
        >
          <div className="mb-3 flex items-center gap-3">
            <img
              src={getAvatarUrl(player.avatarSeed)}
              alt={`${player.name} avatar`}
              className="h-14 w-14 rounded-full border border-sky-400/40 bg-slate-800 object-cover"
            />
            <div>
              <h3 className="text-base font-semibold text-white">{player.name}</h3>
              <p className="text-sm text-slate-300">Rank #{player.currentRank}</p>
            </div>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-3 text-sm">
            <p className="mb-1 text-slate-400">Favorite leader</p>
            <p className="font-medium text-sky-300">{player.favoriteLeader}</p>
          </div>
        </motion.article>
      ))}
    </div>
  );
}

function DeckCard({ deck }) {
  const [expanded, setExpanded] = useState(false);
  const player = getPlayerById(deck.playerId);

  return (
    <motion.article
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border border-sky-500/20 bg-slate-900/70 p-4 shadow-[0_10px_30px_rgba(2,6,23,0.45)] backdrop-blur-md"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{deck.leader}</h3>
          <p className="mt-1 text-sm text-slate-300">Pilot: {player?.name ?? "Unknown Player"}</p>
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${typeBadgeStyles[deck.type] ?? "bg-slate-700 text-slate-200 border-slate-500"}`}
        >
          {deck.type}
        </span>
      </div>

      <div className="mb-3 flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2">
        <span className="text-sm text-slate-400">Win Rate</span>
        <span className="text-base font-semibold text-emerald-300">{deck.winRate}%</span>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm text-slate-200 transition hover:border-sky-400/60 hover:text-sky-300"
      >
        <span>Card list</span>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 overflow-hidden rounded-xl border border-slate-700 bg-slate-900/60"
          >
            {deck.cards.map((card) => (
              <li key={card} className="border-b border-slate-800 px-3 py-2 text-sm text-slate-300 last:border-b-0">
                {card}
              </li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </motion.article>
  );
}

function DecksSection() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {decks.map((deck) => (
        <DeckCard key={deck.id} deck={deck} />
      ))}
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("rankings");
  const [sortConfig, setSortConfig] = useState({ key: "points", direction: "desc" });

  const mergedRankings = useMemo(() => {
    return rankings
      .map((row) => {
        const player = getPlayerById(row.playerId);
        const totalMatches = row.wins + row.losses;
        const winRate = totalMatches === 0 ? 0 : Math.round((row.wins / totalMatches) * 100);

        return {
          ...row,
          name: player?.name ?? "Unknown Player",
          winRate,
        };
      })
      .sort((a, b) => b.points - a.points)
      .map((row, index) => ({ ...row, position: index + 1 }));
  }, []);

  const sortedRankings = useMemo(() => {
    const sorted = [...mergedRankings].sort((a, b) => {
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
  }, [mergedRankings, sortConfig]);

  function handleSort(key) {
    setSortConfig((current) => {
      if (current.key === key) {
        return { key, direction: current.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "desc" };
    });
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-3xl border border-sky-500/20 bg-gradient-to-br from-sky-900/30 via-slate-900 to-amber-900/20 p-6 shadow-[0_20px_50px_rgba(2,6,23,0.5)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                {leagueMeta.leagueName}
              </h1>
              <p className="mt-2 text-sm text-sky-200/90 md:text-base">{leagueMeta.subtitle}</p>
            </div>
            <nav className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? "border-sky-400/70 bg-sky-500/20 text-sky-200 shadow-[0_0_0_1px_rgba(56,189,248,0.3)]"
                        : "border-slate-700 bg-slate-900/80 text-slate-300 hover:border-slate-500 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </header>

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
                <Trophy className="h-5 w-5 text-amber-300" />
                <h2 className="text-xl font-semibold text-white">League Rankings</h2>
              </div>
              <RankingsSection data={sortedRankings} sortConfig={sortConfig} onSort={handleSort} />
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
                <Swords className="h-5 w-5 text-sky-300" />
                <h2 className="text-xl font-semibold text-white">Popular Decks</h2>
              </div>
              <DecksSection />
            </motion.section>
          ) : null}

          {activeTab === "players" ? (
            <motion.section
              key="players"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
            >
              <div className="mb-4 flex items-center gap-2">
                <UserCircle2 className="h-5 w-5 text-violet-300" />
                <h2 className="text-xl font-semibold text-white">League Players</h2>
              </div>
              <PlayersSection />
            </motion.section>
          ) : null}
        </AnimatePresence>
      </div>
    </main>
  );
}
