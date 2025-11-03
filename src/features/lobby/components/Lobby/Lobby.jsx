import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMatches } from "@/features/lobby/hooks/useMatches";
import FeaturedMatch from "@/features/lobby/components/FeaturedMatch/FeaturedMatch";
import HotPolls from "@/features/lobby/components/HotPolls/HotPolls";
import LiveCommentaryFeed from "@/features/lobby/components/LiveCommentaryFeed/LiveCommentaryFeed";
import SportSelector from "@/features/lobby/components/SportSelector/SportSelector";
import MatchFilters from "@/features/lobby/components/MatchFilters/MatchFilters";
import {
  getMatchTimeStatus,
  calculateHeatScore,
  getHeatEmoji,
  getHeatClass,
} from "@/utils/helpers";
import "./Lobby.css";

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

    // 👇 NOUVELLE LOGIQUE DE TRI AMÉLIORÉE 👇
    const statusOrder = { LIVE: 1, SCHEDULED: 2, FINISHED: 3 };

    const sortedMatches = [...filteredMatches].sort((a, b) => {
      // 1. Tri par statut (LIVE > SCHEDULED > FINISHED)
      const orderA = statusOrder[a.status] || 99;
      const orderB = statusOrder[b.status] || 99;
      if (orderA !== orderB) return orderA - orderB;

      // 2. Pour les matchs À VENIR, tri par Hype Score (décroissant)
      if (a.status === "SCHEDULED") {
        return (b.usersEngaged || 0) - (a.usersEngaged || 0);
      }

      // 3. Pour les matchs TERMINÉS, tri par date (du plus récent au plus ancien)
      if (a.status === "FINISHED") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }

      return 0; // Pour les autres cas (ex: deux matchs LIVE)
    });

    // Le match à la une est le premier de la liste triée (le plus pertinent)
    const featMatch = sortedMatches[0] || null;

    // On retire le match à la une de la liste des "autres"
    const otherMatchesBase = featMatch ? sortedMatches.slice(1) : [];

    // On re-trie les autres matchs par date pour un affichage chronologique cohérent
    const sortedOthers = otherMatchesBase.sort((a, b) => {
      const orderA = statusOrder[a.status] || 99;
      const orderB = statusOrder[b.status] || 99;
      if (orderA !== orderB) return orderA - orderB;

      if (a.status === "FINISHED") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }

      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    const leagues = [...new Set(allMatches.map((m) => m.competition))];

    return {
      featuredMatch: featMatch,
      otherMatches: sortedOthers,
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
              {otherMatches.map((match) => {
                const pollScores = (match.polls || []).map((poll) =>
                  calculateHeatScore(poll)
                );
                const averageHeatScore =
                  pollScores.length > 0
                    ? pollScores.reduce((a, b) => a + b, 0) / pollScores.length
                    : 0;
                const heatEmoji = getHeatEmoji(averageHeatScore);
                const heatClass = getHeatClass(averageHeatScore);

                return (
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
                        <div className={`heat-badge ${heatClass}`}>
                          {heatEmoji} • {match.usersEngaged} fans
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
                );
              })}
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
