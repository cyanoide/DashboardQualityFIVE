"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Papa from "papaparse";

/**
 * ⚽ Player Stats Dashboard – Version "Cinq-à-Sept" (dataset perso)
 *
 * 👉 Colonnes attendues (CSV ou dataset interne ci-dessous) :
 *    player,participations,wins,win_ratio,draws,goals,goals_per_match,assists,assists_per_match,avg_time_to_goal,title_bu,title_assist,photo_url,note
 *
 * - Décimales : virgule ou point acceptées (ex: 1,8 ou 1.8).
 * - Les champs absents ou "-" sont traités à 0, et la colonne `note` peut contenir un texte (ex: "Faut jouer...").
 */

const SAMPLE: Row[] = [
  { player: "Abdel Karim", participations: 5, wins: 4, win_ratio: 0.80, draws: 0, goals: 9, goals_per_match: 1.8, assists: 10, assists_per_match: 2.0, avg_time_to_goal: 16, title_bu: 2, title_assist: 5, photo_url: "", note: "" },
  { player: "Constantin", participations: 9, wins: 7, win_ratio: 0.78, draws: 0, goals: 17, goals_per_match: 1.888888889, assists: 7, assists_per_match: 0.7777777778, avg_time_to_goal: 23, title_bu: 6, title_assist: 3, photo_url: "", note: "" },
  { player: "Enos", participations: 3, wins: 1, win_ratio: 0.33, draws: 0, goals: 9, goals_per_match: 3.0, assists: 2, assists_per_match: 0.6666666667, avg_time_to_goal: 16, title_bu: 1, title_assist: 2, photo_url: "", note: "" },
  { player: "Jesus", participations: 4, wins: 1, win_ratio: 0.25, draws: 0, goals: 2, goals_per_match: 0.5, assists: 4, assists_per_match: 1.0, avg_time_to_goal: 40, title_bu: 1, title_assist: 3, photo_url: "", note: "" },
  { player: "Abdel Rafik", participations: 0, wins: 0, win_ratio: 0, draws: 0, goals: 0, goals_per_match: 0, assists: 0, assists_per_match: 0, avg_time_to_goal: 0, title_bu: 0, title_assist: 0, photo_url: "", note: "Faut jouer..." },
  { player: "Anasse", participations: 4, wins: 1, win_ratio: 0.25, draws: 0, goals: 2, goals_per_match: 0.5, assists: 1, assists_per_match: 0.25, avg_time_to_goal: 80, title_bu: 1, title_assist: 0, photo_url: "", note: "" },
  { player: "Nabil", participations: 0, wins: 0, win_ratio: 0, draws: 0, goals: 0, goals_per_match: 0, assists: 0, assists_per_match: 0, avg_time_to_goal: 0, title_bu: 0, title_assist: 0, photo_url: "", note: "Faut jouer..." },
  { player: "Dorian", participations: 0, wins: 0, win_ratio: 0, draws: 0, goals: 0, goals_per_match: 0, assists: 0, assists_per_match: 0, avg_time_to_goal: 0, title_bu: 0, title_assist: 0, photo_url: "", note: "Faut jouer..." },
  { player: "Sidoine", participations: 0, wins: 0, win_ratio: 0, draws: 0, goals: 0, goals_per_match: 0, assists: 0, assists_per_match: 0, avg_time_to_goal: 0, title_bu: 0, title_assist: 0, photo_url: "", note: "Faut jouer..." },
  { player: "Luka", participations: 0, wins: 0, win_ratio: 0, draws: 0, goals: 0, goals_per_match: 0, assists: 0, assists_per_match: 0, avg_time_to_goal: 0, title_bu: 0, title_assist: 0, photo_url: "", note: "Faut jouer..." },
  { player: "Christian", participations: 0, wins: 0, win_ratio: 0, draws: 0, goals: 0, goals_per_match: 0, assists: 0, assists_per_match: 0, avg_time_to_goal: 0, title_bu: 0, title_assist: 0, photo_url: "", note: "Faut jouer..." },
  { player: "Mahamat", participations: 1, wins: 1, win_ratio: 1.0, draws: 0, goals: 3, goals_per_match: 3.0, assists: 1, assists_per_match: 1.0, avg_time_to_goal: 15, title_bu: 0, title_assist: 1, photo_url: "", note: "" },
];

interface Row {
  player: string;
  participations: number;
  wins: number;
  win_ratio: number; // 0..1
  draws: number;
  goals: number;
  goals_per_match: number;
  assists: number;
  assists_per_match: number;
  avg_time_to_goal: number; // minutes
  title_bu: number; // "Titre BU"
  title_assist: number; // "Titre Assist"
  photo_url?: string;
  note?: string;
}

export default function PlayerStatsDashboard() {
  const [rows, setRows] = useState<Row[]>(SAMPLE);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string>(rows[0]?.player ?? "");

  // Import CSV
  const onImport = (file?: File | null) => {
    if (!file) return;
    Papa.parse<any>(file, {
      header: true,
      dynamicTyping: false,
      skipEmptyLines: true,
      complete: (res) => {
        const toNum = (v: any): number => {
          if (v === undefined || v === null || v === "-") return 0;
          const s = String(v).trim().replace(/,/g, ".");
          const n = parseFloat(s);
          return isNaN(n) ? 0 : n;
        };
        const clean: Row[] = (res.data || []).map((r: any) => ({
          player: String(r.player || r.Joueurs || r.joueur || "").trim(),
          participations: toNum(r.participations ?? r.Participations),
          wins: toNum(r.wins ?? r.Victoires),
          win_ratio: toNum(r.win_ratio ?? r["Ratio VICTOIRES"] ?? r["Ratio\nVictoires"] ?? r["RatioVictoires"] ?? r["Ratio Victoires"]),
          draws: toNum(r.draws ?? r["Matchs Nuls"] ?? r.nuls),
          goals: toNum(r.goals ?? r["Nombre de buts"] ?? r.buts),
          goals_per_match: toNum(r.goals_per_match ?? r["Buts/Matchs"]),
          assists: toNum(r.assists ?? r["Nombre de passés décisives"] ?? r["Nombre de passes décisives"] ?? r.passes),
          assists_per_match: toNum(r.assists_per_match ?? r["Passes décisives / Match"]),
          avg_time_to_goal: toNum(r.avg_time_to_goal ?? r["Temps Moy av. but"]),
          title_bu: toNum(r.title_bu ?? r["Titre BU"] ?? r["Titre_BU"]),
          title_assist: toNum(r.title_assist ?? r["Titre Assist"] ?? r["Titre_Assist"]),
          photo_url: String(r.photo_url || r.photo || "").trim(),
          note: String(r.note || r.Note || r.message || "").trim(),
        })).filter((r: Row) => r.player.length > 0);
        setRows(clean.length ? clean : SAMPLE);
        if (clean.length) setSelected(clean[0].player);
      },
    });
  };

  const filtered = useMemo(() => {
    const qLower = q.toLowerCase();
    return rows.filter((r) => qLower === "" || r.player.toLowerCase().includes(qLower));
  }, [rows, q]);

  const players = useMemo(
    () => Array.from(new Set(filtered.map((r) => r.player))).sort(),
    [filtered]
  );

  const selectedRow = useMemo(() => rows.find((r) => r.player === selected) || null, [rows, selected]);

  const selectedProfile = useMemo(() => {
    const line = selectedRow;
    if (!line) return null;
    const url = line.photo_url && line.photo_url.length > 5
      ? line.photo_url
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(line.player)}&background=random`;
    return {
      name: line.player,
      photo: url,
      note: line.note || "",
      ...line,
    };
  }, [selectedRow]);

  const barsSelected = useMemo(() => {
    if (!selectedRow) return [] as any[];
    return [
      { metric: "Buts", value: selectedRow.goals },
      { metric: "Passes", value: selectedRow.assists },
      { metric: "Victoires", value: selectedRow.wins },
      { metric: "Participations", value: selectedRow.participations },
    ];
  }, [selectedRow]);

  const leaders = useMemo(() => {
    const arr = rows.slice();
    const mkPhoto = (name: string, url?: string) => url && url.length > 5 ? url : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
    const topGoals = arr.slice().sort((a, b) => b.goals - a.goals).slice(0, 5).map((p) => ({
      player: p.player,
      value: p.goals,
      photo: mkPhoto(p.player, p.photo_url),
    }));
    const topAssists = arr.slice().sort((a, b) => b.assists - a.assists).slice(0, 5).map((p) => ({
      player: p.player,
      value: p.assists,
      photo: mkPhoto(p.player, p.photo_url),
    }));
    return { topGoals, topAssists };
  }, [rows]);

  return (
    <div className="min-h-screen w-full bg-neutral-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard Foot – Stats & Portrait</h1>
            <p className="text-sm text-neutral-600">Charge un CSV (colonnes FR) ou utilise le dataset intégré. Recherche par nom, clique pour voir le profil, KPIs et graphiques.</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="csv"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => onImport(e.target.files?.[0])}
            />
            <Label htmlFor="csv">
              <Button variant="secondary">Importer CSV</Button>
            </Label>
            <Button variant="outline" onClick={() => { setRows(SAMPLE); setSelected(SAMPLE[0]?.player || ""); }}>Réinitialiser</Button>
          </div>
        </div>

        {/* Recherche */}
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label>Rechercher un joueur</Label>
              <Input placeholder="ex: Constantin" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="text-sm text-neutral-600 self-end">{rows.length} entrées</div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche : Liste joueurs */}
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>Joueurs ({players.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[560px] overflow-auto pr-2">
              {players.map((name) => {
                const row = rows.find((r) => r.player === name);
                const img = row?.photo_url && row.photo_url.length > 5
                  ? row.photo_url
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
                return (
                  <button
                    key={name}
                    onClick={() => setSelected(name)}
                    className={`w-full flex items-center gap-3 rounded-xl p-2 transition border ${selected === name ? "bg-neutral-100 border-neutral-300" : "hover:bg-neutral-50 border-transparent"}`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={img} alt={name} />
                      <AvatarFallback>{initials(name)}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <div className="font-medium leading-tight">{name}</div>
                      <div className="text-xs text-neutral-600">{row?.note || ""}</div>
                    </div>
                  </button>
                );
              })}
              {players.length === 0 && (
                <p className="text-sm text-neutral-600">Aucun joueur trouvé. Essayez d'effacer la recherche.</p>
              )}
            </CardContent>
          </Card>

          {/* Centre : Profil + KPIs */}
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="pt-6">
              {selectedProfile ? (
                <div className="flex flex-col sm:flex-row gap-5 sm:items-center">
                  <Avatar className="h-24 w-24 ring-2 ring-white shadow-md">
                    <AvatarImage src={selectedProfile.photo} alt={selectedProfile.name} />
                    <AvatarFallback className="text-xl">{initials(selectedProfile.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold leading-tight">{selectedProfile.name}</h2>
                      {selectedProfile.note && (<><span className="text-neutral-500">·</span><span className="text-neutral-600">{selectedProfile.note}</span></>)}
                    </div>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-6 gap-3">
                      <KPI label="Participations" value={selectedProfile.participations} />
                      <KPI label="Victoires" value={selectedProfile.wins} />
                      <KPI label="Ratio V" value={(selectedProfile.win_ratio*100).toFixed(0) + '%'} />
                      <KPI label="Buts" value={selectedProfile.goals} />
                      <KPI label="Passes" value={selectedProfile.assists} />
                      <KPI label="Temps moy/But (min)" value={selectedProfile.avg_time_to_goal} />
                      <KPI label="Buts/Match" value={round(selectedProfile.goals_per_match,2)} />
                      <KPI label="Passes/Match" value={round(selectedProfile.assists_per_match,2)} />
                      <KPI label="Titres BU" value={selectedProfile.title_bu} />
                      <KPI label="Titres Assist" value={selectedProfile.title_assist} />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-neutral-600">Sélectionnez un joueur pour voir son profil.</p>
              )}
            </CardContent>
          </Card>

          {/* Graphique pour le joueur sélectionné */}
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>Profil chiffré (joueur sélectionné)</CardTitle>
            </CardHeader>
            <CardContent className="h-72 pt-0">
              {barsSelected.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barsSelected} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-neutral-600">Aucune donnée pour ce joueur.</p>
              )}
            </CardContent>
          </Card>

          {/* Leaders */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle>Top buteurs (total)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {leaders.topGoals.map((p, i) => (
                  <LeaderRow key={p.player} rank={i + 1} player={p.player} value={p.value} photo={p.photo} />
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle>Top passeurs (total)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {leaders.topAssists.map((p, i) => (
                  <LeaderRow key={p.player} rank={i + 1} player={p.player} value={p.value} photo={p.photo} />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border bg-white p-4 text-center shadow-sm">
      <div className="text-xs uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function LeaderRow({ rank, player, value, photo }: { rank: number; player: string; value: number; photo: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border p-2 bg-white">
      <div className="w-6 text-sm text-neutral-500">#{rank}</div>
      <Avatar className="h-8 w-8">
        <AvatarImage src={photo} alt={player} />
        <AvatarFallback>{initials(player)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="font-medium leading-tight">{player}</div>
      </div>
      <div className="text-right font-semibold">{value}</div>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}

function round(n: number, d = 1) {
  const p = Math.pow(10, d);
  return Math.round(n * p) / p;
}
