import { useState, useEffect, useCallback } from "react"; // 👈 Ajout de useCallback
import type { Match } from "../types";
import masterSportData from "@/data/masterSportData";
import { generateRageBaitContent } from "@/services/aiContentGenerator";
import { useCache } from "@/hooks/useCache"; // 👈 On importe notre nouveau hook

const THESPORTSDB_KEY = "123";
const TOP_LEAGUES = [
  { name: "Ligue 1", id: "4334" },
  { name: "Premier League", id: "4328" },
  { name: "La Liga", id: "4335" },
  { name: "Serie A", id: "4332" },
  { name: "Bundesliga", id: "4331" },
];

/**
 * Hook pour récupérer et gérer la liste des matchs, maintenant avec un cache de session.
 */
export function useMatches(sport: string) {
  // 👇 NOUVEAU : La logique de fetch est maintenant encapsulée dans un useCallback
  const fetcher = useCallback(async () => {
    if (sport !== "football") {
      return [];
    }

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

      return fetchedMatches;
    } catch (err: any) {
      console.warn(`API a échoué. Fallback local.`, err.message);
      // En cas d'erreur de fetch, on utilise les données locales
      return (masterSportData.football?.matches as Match[]) || [];
    }
  }, [sport]); // Le fetcher ne sera recréé que si le sport change

  // 👇 MODIFICATION : On utilise notre hook de cache !
  const {
    data: matches,
    loading,
    error,
  } = useCache(`matches_${sport}`, fetcher, 60000 * 5); // Cache de 5 minutes

  return { matches: matches || [], loading, error };
}
