import React, { useState, useMemo } from "react";
import { useMatchData } from "../../hooks/useMatchData";
import PollCard from "../PollCard/PollCard";
import Chat from "../Chat/Chat";
import "./MatchPage.css";

const MatchPage = () => {
  // 👇 Le hook gère toute la complexité du chargement des données
  const { match, polls, loading } = useMatchData();

  const [activePollId, setActivePollId] = useState(null);
  const [activeChatId, setActiveChatId] = useState("general");

  // Logique pour déterminer le sondage actif (ceci reste de la logique de présentation)
  const { activePoll, otherPolls } = useMemo(() => {
    if (!polls || polls.length === 0) {
      return { activePoll: null, otherPolls: [] };
    }

    // Définit un sondage par défaut si aucun n'est actif
    if (!activePollId) {
      const winnerPoll = polls.find((p) => p.id === "vainqueur_match");
      const defaultPollId = winnerPoll ? winnerPoll.id : polls[0].id;
      setActivePollId(defaultPollId);
    }

    const currentActive = polls.find((p) => p.id === activePollId);
    const others = polls.filter((p) => p.id !== activePollId);

    return { activePoll: currentActive, otherPolls: others };
  }, [polls, activePollId]);

  const handleSelectPoll = (poll) => {
    setActivePollId(poll.id);
    setActiveChatId(poll.id === "vainqueur_match" ? "general" : poll.id);
  };

  if (loading || !match) {
    return <div className="loading">Préparation de la Fan Zone...</div>;
  }

  return (
    <div className="fan-zone-page-container">
      <div className="fan-zone-layout">
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
        <div className="fan-zone-main">
          {activePoll && <PollCard poll={activePoll} match={match} />}
        </div>
        <div className="fan-zone-chat">
          <Chat
            matchId={String(match.id)}
            chatId={activeChatId}
            featuredPollData={activePoll}
          />
        </div>
      </div>
    </div>
  );
};

export default MatchPage;
