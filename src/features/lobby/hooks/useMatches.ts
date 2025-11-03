import { useState, useEffect } from "react";
import type { Match } from "../types";
import masterSportData from "@/data/masterSportData";
import { generateRageBaitContent } from "@/services/aiContentGenerator";

const THESPORTSDB_KEY = "123";
const TOP_LEAGUES = [
  { name: "Ligue 1", id: "4334" },
  { name: "Premier League", id: "4328" },
  { name: "La Liga", id: "4335" },
  { name: "Serie A", id: "4332" },
  { name: "Bundesliga", id: "4331" },
];

/**
 * Hook pour récupérer et gérer la liste des matchs.
 * Gère le chargement, les erreurs et le fallback sur les données locales.
 */
export function useMatches(sport: string) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sport !== "football") {
      setMatches([]);
      setLoading(false);
      return;
    }

    const fetchMatches = async () => {
      setLoading(true);
      setError(null);
      try {
        let allApiMatches: any[] = [];

        for (const league of TOP_LEAGUES) {
          const [nextResponse, pastResponse] = await Promise.all([
            fetch(
              `/api-football/${THESPORTSDB_KEY}/eventsnextleague.php?id=${league.id}`
            ),
            fetch(
              `/api-football/${THESPORTSDB_KEY}/eventspastleague.php?id=${league.id}`
            ),
          ]);

          if (nextResponse.ok) {
            const data = await nextResponse.json();
            if (data.events) allApiMatches.push(...data.events);
          }
          if (pastResponse.ok) {
            const data = await pastResponse.json();
            if (data.events) allApiMatches.push(...data.events);
          }
          await new Promise((res) => setTimeout(res, 200));
        }

        if (allApiMatches.length === 0) {
          throw new Error("L'API n'a retourné aucun match.");
        }

        const uniqueMatches = Array.from(
          new Map(allApiMatches.map((match) => [match.idEvent, match])).values()
        );
        const fetchedMatches: Match[] = uniqueMatches.map((match: any) => {
          const matchDate = match.strTime
            ? `${match.dateEvent}T${match.strTime}Z`
            : match.dateEvent;
          const isFinished =
            match.intHomeScore !== null && match.intAwayScore !== null;
          const rageBaitData = generateRageBaitContent({
            teamA: match.strHomeTeam,
            teamB: match.strAwayTeam,
          });

          // 👇 MODIFICATION : On rend le nombre de fans stable et prédictible
          const deterministicRandom =
            parseInt(match.idEvent.slice(-4), 16) || 1000;
          const usersEngaged = match.intSpectators
            ? parseInt(match.intSpectators.replace(/,/g, ""), 10)
            : (deterministicRandom % 4000) + 500;

          return {
            id: match.idEvent,
            competition: match.strLeague,
            date: matchDate,
            status: isFinished ? "FINISHED" : "SCHEDULED",
            scoreA: match.intHomeScore,
            scoreB: match.intAwayScore,
            teamA: match.strHomeTeam,
            teamB: match.strAwayTeam,
            logoA: match.strHomeTeamBadge,
            logoB: match.strAwayTeamBadge,
            bgImage:
              match.strThumb ||
              `https://picsum.photos/seed/${match.idEvent}/800/600`,
            sportKey: "football",
            polls: rageBaitData.polls,
            usersEngaged: usersEngaged,
          };
        });

        setMatches(fetchedMatches);
      } catch (err: any) {
        setError(err.message);
        console.warn(`API a échoué. Fallback local.`, err.message);
        setMatches((masterSportData.football?.matches as Match[]) || []);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [sport]);

  return { matches, loading, error };
}
