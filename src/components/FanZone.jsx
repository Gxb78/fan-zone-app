// src/components/FanZone.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
  const [activeChatId, setActiveChatId] = useState("general");

  const { matchId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const initializeFanZone = async () => {
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
      setMatch(fullMatchData);

      if (pollsFromDb && pollsFromDb.length > 0) {
        const winnerPoll = pollsFromDb.find((p) => p.id === "vainqueur_match");
        const defaultPollId = winnerPoll ? winnerPoll.id : pollsFromDb[0].id;
        setActivePollId(defaultPollId);
        setActiveChatId(
          defaultPollId === "vainqueur_match" ? "general" : defaultPollId
        );
      }
      setLoading(false);
    };
    initializeFanZone();
  }, [matchId, location.state, navigate]);

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

  const handleSelectPoll = (poll) => {
    setActivePollId(poll.id);
    setActiveChatId(poll.id === "vainqueur_match" ? "general" : poll.id);
  };

  if (loading || !match) {
    return <div className="loading">Préparation de la Fan Zone...</div>;
  }

  const hydratedPolls =
    match.polls?.map((poll) => ({
      ...poll,
      ...(livePollsData[poll.id] || {}),
    })) || [];

  const activePoll = hydratedPolls.find((p) => p.id === activePollId);
  const otherPolls = hydratedPolls.filter((p) => p.id !== activePollId);

  return (
    <div className="fan-zone-page-container">
      {/* 👇 On utilise la nouvelle structure à 3 colonnes */}
      <div className="fan-zone-layout">
        {/* --- COLONNE GAUCHE --- */}
        <div className="fan-zone-sidebar-left">
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

        {/* --- COLONNE CENTRALE --- */}
        <div className="fan-zone-main">
          {activePoll && <PollCard poll={activePoll} match={match} />}
        </div>

        {/* --- COLONNE DROITE --- */}
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
