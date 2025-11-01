// src/components/Lobby.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import FeaturedMatch from "./FeaturedMatch";
import HotPolls from "./HotPolls";
import LiveCommentaryFeed from "./LiveCommentaryFeed";
import SportSelector from "./SportSelector";
import MatchFilters from "./MatchFilters";
import masterSportData from "../data/masterSportData";
import { getMatchTimeStatus } from "../utils/helpers";
import { generateRageBaitContent } from "../services/aiContentGenerator";
import "./Lobby.css";

const THESPORTSDB_KEY = "123";
const TOP_LEAGUES = [
  { name: "Ligue 1", id: "4334" },
  { name: "Premier League", id: "4328" },
  { name: "La Liga", id: "4335" },
  { name: "Serie A", id: "4332" },
  { name: "Bundesliga", id: "4331" },
];

const Lobby = () => {
  const [allMatches, setAllMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState("football");
  const [selectedLeague, setSelectedLeague] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedSport !== "football") {
      setAllMatches([]);
      setLoading(false);
      return;
    }

    const fetchMatches = async () => {
      setLoading(true);
      try {
        console.log(
          "⚽ Appel API via PROXY pour les 5 grands championnats (poliment)..."
        );
        let allApiMatches = [];

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
        const fetchedMatches = uniqueMatches.map((match) => {
          const matchDate = match.strTime
            ? `${match.dateEvent}T${match.strTime}Z`
            : match.dateEvent;
          const isFinished =
            match.intHomeScore !== null && match.intAwayScore !== null;
          const rageBaitData = generateRageBaitContent({
            teamA: match.strHomeTeam,
            teamB: match.strAwayTeam,
          });

          return {
            id: match.idEvent,
            competition: match.strLeague,
            date: matchDate,
            status: isFinished ? "FINISHED" : "SCHEDULED",
            scoreA: match.intHomeScore,
            scoreB: match.intAwayScore,
            liveMinute: null,
            teamA: match.strHomeTeam,
            teamB: match.strAwayTeam,
            logoA: match.strHomeTeamBadge,
            logoB: match.strAwayTeamBadge,
            bgImage:
              match.strThumb ||
              `https://picsum.photos/seed/${match.idEvent}/800/600`,
            sportKey: "football",
            polls: rageBaitData.polls,
            usersEngaged: match.intSpectators
              ? parseInt(match.intSpectators.replace(/,/g, ""), 10)
              : Math.floor(Math.random() * 4000) + 500,
          };
        });
        setAllMatches(fetchedMatches);
      } catch (error) {
        console.warn(`API a échoué. Fallback local.`, error.message);
        setAllMatches(masterSportData.football?.matches || []);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [selectedSport]);

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
      if (a.status === "SCHEDULED") return new Date(a.date) - new Date(b.date);
      if (a.status === "FINISHED") return new Date(b.date) - new Date(a.date);
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
            {otherMatches.length === 0 && featuredMatch && (
              <div className="no-data">
                Aucun autre match ne correspond à vos filtres.
              </div>
            )}
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
