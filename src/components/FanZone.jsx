// src/components/FanZone.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
// 👇 On s'assure d'importer getPollsForMatch
import {
  getOrCreateMatch,
  getPollsForMatch,
  subscribeToPoll,
} from "../services/firebase";
import PollCard from "./PollCard";
import Chat from "./Chat";
import "./FanZone.css";

const FanZone = () => {
  const [match, setMatch] = useState(null);
  const [livePollsData, setLivePollsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activePollId, setActivePollId] = useState(null);
  const [activeChatId, setActiveChatId] = useState("general"); // Le chat général est actif par défaut

  const { matchId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // --- EFFET 1 : INITIALISATION DU MATCH ET DE SES SONDAGES ---
  useEffect(() => {
    const initializeFanZone = async () => {
      setLoading(true);
      const passedMatchData = location.state?.matchData;

      if (!passedMatchData) {
        console.warn("Aucune donnée de match, retour au lobby.");
        navigate("/");
        return;
      }

      // 1. On récupère ou on crée le document principal du match (SANS les sondages)
      const firebaseMatchData = await getOrCreateMatch(passedMatchData);

      // 2. ENSUITE, on va chercher les sondages dans leur "pièce" dédiée (la subcollection)
      const pollsFromDb = await getPollsForMatch(String(firebaseMatchData.id));

      // 3. On combine les infos du match ET ses sondages pour avoir un objet complet
      const fullMatchData = { ...firebaseMatchData, polls: pollsFromDb };
      setMatch(fullMatchData);

      // 4. CORRECTION: On cherche explicitement le sondage "vainqueur_match"
      if (pollsFromDb && pollsFromDb.length > 0) {
        const winnerPoll = pollsFromDb.find((p) => p.id === "vainqueur_match");
        const defaultPollId = winnerPoll ? winnerPoll.id : pollsFromDb[0].id;

        setActivePollId(defaultPollId);

        // Si l'ID est "vainqueur_match", on active le chat "general"
        if (defaultPollId === "vainqueur_match") {
          setActiveChatId("general");
        } else {
          // Sinon, on utilise le chat spécifique du premier sondage
          setActiveChatId(defaultPollId);
        }
      }

      setLoading(false);
    };

    initializeFanZone();
  }, [matchId, location.state, navigate]);

  // --- EFFET 2 : ABONNEMENT AUX MISES À JOUR DES SONDAGES ---
  useEffect(() => {
    if (!match?.polls) return;

    const unsubscribers = match.polls.map((poll) => {
      const pollDbPath = ["matches", String(match.id), "polls", poll.id];
      return subscribeToPoll(pollDbPath, (liveData) => {
        if (liveData) {
          setLivePollsData((prevData) => ({
            ...prevData,
            [poll.id]: liveData,
          }));
        }
      });
    });

    return () => unsubscribers.forEach((unsub) => unsub());
  }, [match]);

  // Fonction pour changer le sondage principal et le chat correspondant
  const handleSelectPoll = (poll) => {
    setActivePollId(poll.id);

    // 👇 CORRECTION SYNTAXE ET LOGIQUE CHAT 👇
    // Si c'est le sondage principal (le premier), on active le chat 'general'.
    // Sinon, on active le chat spécifique à l'ID du sondage.
    if (poll.id === "vainqueur_match") {
      setActiveChatId("general");
    } else {
      setActiveChatId(poll.id);
    }
  }; // <-- L'accolade était manquante ici !

  if (loading || !match) {
    return <div className="loading">Préparation de la Fan Zone...</div>;
  }

  // On "hydrate" les sondages de base avec les données temps réel (votes, etc.)
  const hydratedPolls = match.polls.map((poll) => {
    return livePollsData[poll.id]
      ? { ...poll, ...livePollsData[poll.id] }
      : poll;
  });

  const activePoll = hydratedPolls.find((p) => p.id === activePollId);
  const otherPolls = hydratedPolls.filter((p) => p.id !== activePollId);

  return (
    <div className="fan-zone-page-container">
      <div className="fan-zone-layout">
        <div className="fan-zone-main">
          {activePoll && <PollCard poll={activePoll} match={match} />}

          {otherPolls.length > 0 && (
            <div className="other-polls-container">
              <h3 className="other-polls-title">Autres Débats</h3>
              <div className="other-polls-grid">
                {otherPolls.map((poll) => (
                  <div
                    key={poll.id}
                    className="other-poll-card"
                    onClick={() => handleSelectPoll(poll)}
                  >
                    <h4>{poll.title}</h4>
                    <p>"{poll.polarizingQuestion}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="fan-zone-chat">
          <Chat
            matchId={String(match.id)}
            chatId={activeChatId}
            otherPolls={hydratedPolls}
            featuredPollData={activePoll}
          />
        </div>
      </div>
    </div>
  );
};

export default FanZone;
