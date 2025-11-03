import { useCallback } from "react";
import type { Match } from "../types";
import masterSportData from "@/data/masterSportData";
import { generateRageBaitContent } from "@/services/aiContentGenerator";
import { useCache } from "@/hooks/useCache";

const THESPORTSDB_KEY = process.env.REACT_APP_THESPORTSDB_KEY || "1";

// 👇 MODIFICATION : Liste de ligues considérablement étendue pour une couverture maximale
const leagues = [
  // Compétitions de clubs majeures
  { id: "4328", name: "Premier League" }, // Angleterre
  { id: "4335", name: "La Liga" }, // Espagne
  { id: "4331", name: "Bundesliga" }, // Allemagne
  { id: "4332", name: "Serie A" }, // Italie
  { id: "4334", name: "Ligue 1" }, // France
  { id: "4480", name: "Champions League" },
  { id: "4481", name: "Europa League" },
  { id: "5008", name: "Europa Conference League" },

  // Autres ligues européennes importantes
  { id: "4337", name: "Primeira Liga" }, // Portugal
  { id: "4330", name: "Eredivisie" }, // Pays-Bas
  { id: "4338", name: "Scottish Premiership" }, // Écosse
  { id: "4345", name: "Super Lig" }, // Turquie
  { id: "4398", name: "Belgian Pro League" }, // Belgique

  // Coupes nationales
  { id: "4482", name: "FA Cup" }, // Coupe d'Angleterre
  { id: "4484", name: "Copa del Rey" }, // Coupe d'Espagne
  { id: "4508", name: "Coupe de France" },

  // Amériques
  { id: "4387", name: "MLS" }, // USA
  { id: "4344", name: "Brasileirão" }, // Brésil
  { id: "4346", name: "Superliga Argentina" }, // Argentine
  { id: "4401", name: "Liga MX" }, // Mexique

  // Compétitions Internationales
  { id: "4429", name: "Coupe du Monde" },
  { id: "4505", name: "Euro" },
  { id: "4715", name: "Copa America" },
  { id: "4430", name: "Coupe d'Afrique des Nations" },
];

/**
 * Hook pour récupérer et gérer la liste des matchs, maintenant avec un cache de session.
 */
export function useMatches(sport: string) {
  const fetcher = useCallback(async () => {
    if (sport !== "football") {
      // @ts-ignore
      return (masterSportData[sport]?.matches as Match[]) || [];
    }

    try {
      let allApiMatches: any[] = [];

      for (const league of leagues) {
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

      const footballOnlyMatches = allApiMatches.filter(
        (match) => match.strSport === "Soccer"
      );

      const uniqueMatches = Array.from(
        new Map(
          footballOnlyMatches.map((match) => [match.idEvent, match])
        ).values()
      );

      const fetchedMatches: Match[] = uniqueMatches.map((match: any) => {
        const matchDate = match.strTimestamp
          ? new Date(match.strTimestamp).toISOString()
          : `${match.dateEvent}T${match.strTime}:00Z`;

        const getStatus = () => {
          if (match.strStatus === "Match Finished") return "FINISHED";
          if (match.intHomeScore !== null && match.intAwayScore !== null)
            return "LIVE";
          return "SCHEDULED";
        };

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
          status: getStatus(),
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
      console.warn(
        `API a échoué. Fallback local pour le sport "${sport}".`,
        err.message
      );
      // @ts-ignore
      return (masterSportData[sport]?.matches as Match[]) || [];
    }
  }, [sport]);

  const {
    data: matches,
    loading,
    error,
  } = useCache(`matches_${sport}`, fetcher, 60000 * 5);

  return { matches: matches || [], loading, error };
}
