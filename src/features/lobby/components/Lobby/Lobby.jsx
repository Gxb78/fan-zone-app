import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMatches } from "@/features/lobby/hooks/useMatches";
// 👇 Imports mis à jour
import FeaturedMatch from "@/features/lobby/components/FeaturedMatch/FeaturedMatch";
import HotPolls from "@/features/lobby/components/HotPolls/HotPolls";
import LiveCommentaryFeed from "@/features/lobby/components/LiveCommentaryFeed/LiveCommentaryFeed";
import SportSelector from "@/features/lobby/components/SportSelector/SportSelector";
import MatchFilters from "@/features/lobby/components/MatchFilters/MatchFilters";
import { getMatchTimeStatus } from "@/utils/helpers";
import "./Lobby.css";

// ... Le reste du composant est identique
const Lobby = () => {
  const [selectedSport, setSelectedSport] = useState("football");
  const [selectedLeague, setSelectedLeague] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const navigate = useNavigate();

  const { matches: allMatches, loading, error } = useMatches(selectedSport);

  const handleSelectMatch = (match, sportKey) => {
    navigate(`/match/${sportKey}/${match.id}`, { state: { matchData: match } });
  };

  const { featuredMatch, otherMatches, availableLeagues } = useMemo(() => {
    const filteredMatches = allMatches.filter((match) => {
      const leagueMatch =
        selectedLeague === "all" || match.competition === selectedLeague;
      const statusMatch =
        selectedStatus === "all" || match.status === selectedStatus;
      return leagueMatch && statusMatch;
    });

    const sortedMatches = [...filteredMatches].sort((a, b) => {
      const statusOrder = { LIVE: 1, SCHEDULED: 2, FINISHED: 3 };
      const orderA = statusOrder[a.status] || 99;
      const orderB = statusOrder[b.status] || 99;
      if (orderA !== orderB) return orderA - orderB;
      if (a.status === "SCHEDULED")
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (a.status === "FINISHED")
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      return 0;
    });

    const featMatch = sortedMatches[0] || null;
    const othMatches = featMatch ? sortedMatches.slice(1) : [];
    const leagues = [...new Set(allMatches.map((m) => m.competition))];

    return {
      featuredMatch: featMatch,
      otherMatches: othMatches,
      availableLeagues: leagues,
    };
  }, [allMatches, selectedLeague, selectedStatus]);

  if (loading) {
    return <div className="loading">Chargement des matchs européens...</div>;
  }

  if (error && allMatches.length === 0) {
    return <div className="no-data">Erreur de chargement des matchs.</div>;
  }

  return (
    <div className="lobby-final-layout">
      <div className="lobby-sidebar-left">
        <LiveCommentaryFeed
          matches={allMatches}
          onSelectMatch={handleSelectMatch}
        />
      </div>
      <div className="lobby-main-content">
        <SportSelector
          selectedSport={selectedSport}
          onSelectSport={setSelectedSport}
        />
        {featuredMatch ? (
          <>
            <FeaturedMatch
              match={featuredMatch}
              onSelectMatch={handleSelectMatch}
            />
            {otherMatches.length > 0 && (
              <h3 className="list-title">Autres Matchs</h3>
            )}
            <div className="match-list-container">
              {otherMatches.map((match) => (
                <div
                  key={match.id}
                  className="match-card"
                  onClick={() => handleSelectMatch(match, match.sportKey)}
                >
                  <div className="match-card-inner">
                    <div
                      className="match-header"
                      style={{ backgroundImage: `url('${match.bgImage}')` }}
                    >
                      <div className="match-competition">
                        {match.competition}
                      </div>
                      <div className="fomo-counter">
                        🔥 {match.usersEngaged} fans débattent
                      </div>
                    </div>
                    <div className="match-body">
                      <div className="match-teams">
                        <div className="team">
                          <img src={match.logoA} alt={match.teamA} />
                          <div className="team-name">{match.teamA}</div>
                        </div>
                        <div className="vs-time">
                          <div className="vs">VS</div>
                          <div className="time-badge">
                            {getMatchTimeStatus(match)}
                          </div>
                        </div>
                        <div className="team">
                          <img src={match.logoB} alt={match.teamB} />
                          <div className="team-name">{match.teamB}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="no-data">
            Aucun match ne correspond à vos filtres.
          </div>
        )}
      </div>
      <div className="lobby-sidebar-right">
        <MatchFilters
          leagues={availableLeagues}
          selectedLeague={selectedLeague}
          onLeagueChange={setSelectedLeague}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />
        <HotPolls matches={allMatches} onSelectMatch={handleSelectMatch} />
      </div>
    </div>
  );
};

export default Lobby;
