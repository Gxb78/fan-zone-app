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
  // 👇 MODIFICATION : Le chargement initial est maintenant considéré comme faux
  const [loading, setLoading] = useState(false);

  const { matchId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const initializeMatch = async () => {
      const passedMatchData = location.state?.matchData;

      if (!passedMatchData) {
        console.warn("Aucune donnée de match, retour au lobby.");
        navigate("/");
        return;
      }

      // 👇 NOUVELLE LOGIQUE "STALE-WHILE-REVALIDATE" 👇

      // 1. AFFICHE IMMÉDIATEMENT : On utilise les données du lobby pour le premier rendu.
      // L'utilisateur voit la page instantanément, sans écran de chargement.
      setMatch(passedMatchData as Match);
      setLoading(false); // On confirme qu'il n'y a pas de chargement bloquant.

      // 2. REVALIDATION EN ARRIÈRE-PLAN : On va chercher les données complètes et à jour sur Firebase.
      try {
        const firebaseMatchData = await getOrCreateMatch(passedMatchData);
        const pollsFromDb = await getPollsForMatch(
          String(firebaseMatchData.id)
        );
        const fullMatchData = { ...firebaseMatchData, polls: pollsFromDb };

        // 3. MISE À JOUR SILENCIEUSE : On met à jour l'état avec les données fraîches.
        // React mettra à jour l'UI de manière transparente.
        setMatch(fullMatchData as Match);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des données complètes du match:",
          error
        );
        // On pourrait afficher un toast d'erreur ici si nécessaire.
      }
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

  // Le `useMemo` est crucial ici : il recalcule les sondages "hydratés"
  // uniquement lorsque les données de base (match) ou les données temps réel (livePollsData) changent.
  const hydratedPolls = useMemo(
    () =>
      match?.polls?.map((poll: any) => ({
        ...poll,
        ...(livePollsData[poll.id] || {}),
      })) || [],
    [match, livePollsData]
  );

  return { match, polls: hydratedPolls, loading: !match && loading }; // Le chargement n'est vrai que si on n'a AUCUNE donnée
}
