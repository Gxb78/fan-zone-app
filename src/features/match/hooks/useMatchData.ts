// 👇 MODIFICATION 1 : Ajouter 'useMemo' à la liste d'imports
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  getOrCreateMatch,
  getPollsForMatch,
  subscribeToPoll,
} from "@/services/firebase";
import type { Match } from "@/features/lobby/types";

export interface Poll {
  id: string;
  title: string;
  polarizingQuestion: string;
  options: { key: string; text: string; order: number }[];
  votes?: { [key: string]: number };
  voters?: { [key: string]: string };
}

export function useMatchData() {
  const [match, setMatch] = useState<Match | null>(null);
  const [livePollsData, setLivePollsData] = useState<{ [key: string]: Poll }>(
    {}
  );
  const [loading, setLoading] = useState(true);

  const { matchId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const initializeMatch = async () => {
      setLoading(true);
      const passedMatchData = location.state?.matchData;

      if (!passedMatchData) {
        console.warn("Aucune donnée de match, retour au lobby.");
        navigate("/");
        return;
      }

      const firebaseMatchData = await getOrCreateMatch(passedMatchData);
      const pollsFromDb = await getPollsForMatch(String(firebaseMatchData.id));
      const fullMatchData = { ...firebaseMatchData, polls: pollsFromDb };

      setMatch(fullMatchData as Match);
      setLoading(false);
    };

    initializeMatch();
  }, [matchId, location.state, navigate]);

  useEffect(() => {
    if (!match?.polls) return;

    const unsubscribers = match.polls.map((poll: any) => {
      const pollDbPath: [string, string, string, string] = [
        "matches",
        String(match.id),
        "polls",
        poll.id,
      ];
      // 👇 MODIFICATION 2 : On type explicitement le paramètre 'liveData'
      return subscribeToPoll(pollDbPath, (liveData: Poll | null) => {
        if (liveData) {
          setLivePollsData((prevData) => ({
            ...prevData,
            [poll.id]: liveData as Poll,
          }));
        }
      });
    });

    return () => unsubscribers.forEach((unsub) => unsub());
  }, [match]);

  const hydratedPolls = useMemo(
    () =>
      match?.polls?.map((poll: any) => ({
        ...poll,
        ...(livePollsData[poll.id] || {}),
      })) || [],
    [match, livePollsData]
  );

  return { match, polls: hydratedPolls, loading };
}
