// src/components/Lobby.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FeaturedMatch from "./FeaturedMatch";
import HotPolls from "./HotPolls";
import HotComments from "./HotComments";
import SportSelector from "./SportSelector";
import masterSportData from "../data/masterSportData";
import { getMatchTimeStatus } from "../utils/helpers";
import "./Lobby.css";

const CACHE_DURATION_MINUTES = 30;
// On garde la clé TheSportsDB ici, car on ne l'utilise que dans ce composant
const THESPORTSDB_KEY = "123"; // API KEY

const Lobby = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState("football");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      setMatches([]);
      const cacheKey = `matches_cache_${selectedSport}`;
      const cachedData = localStorage.getItem(cacheKey);

      if (cachedData) {
        const { timestamp, data } = JSON.parse(cachedData);
        const isCacheFresh =
          Date.now() - timestamp < CACHE_DURATION_MINUTES * 60 * 1000;
        if (isCacheFresh) {
          console.log(
            `✅ Matchs pour ${selectedSport} chargés depuis le cache !`
          );
          setMatches(data);
          setLoading(false);
          return;
        }
      }

      // CORRECTION DU SCOPE : Déclaration de fetchedMatches en dehors du bloc try
      let fetchedMatches = [];

      try {
        if (selectedSport === "basketball") {
          // --- LOGIQUE POUR LE BASKET (API-SPORTS) ---
          console.log(
            "🏀 Appel API-SPORTS (via proxy) pour les matchs de NBA..."
          );
          const response = await fetch("/api/games?league=12&season=2023-2024");
          const data = await response.json();
          if (
            data.errors &&
            Object.keys(data.errors).length > 0 &&
            !data.response
          )
            throw new Error("L'API a renvoyé une erreur.");

          const apiMatches = data.response || [];
          if (apiMatches.length === 0)
            throw new Error("L'API n'a retourné aucun match de basket.");

          const limitedMatches = apiMatches.slice(0, 5);
          fetchedMatches = limitedMatches.map((game) => {
            // --- LOGIQUE POUR EXTRAIRE LE STATUT ET LE SCORE ---
            const status = game.status.short;
            let matchStatus = "SCHEDULED";
            let liveMinute = null;
            let scoreA =
              game.scores.home.points != null ? game.scores.home.points : 0;
            let scoreB =
              game.scores.away.points != null ? game.scores.away.points : 0;

            // 🏀 CORRECTION STATUT BASKET (FINISHED vs LIVE)
            if (status === "FT") {
              matchStatus = "FINISHED"; // Score final affiché
            } else if (["Q1", "Q2", "Q3", "Q4", "OT", "HT"].includes(status)) {
              matchStatus = "LIVE";
              // On affiche la période courante
              liveMinute = status;
            } else {
              matchStatus = "SCHEDULED"; // Date/heure affichée
              scoreA = 0;
              scoreB = 0;
            }
            // ----------------------------------------------------

            return {
              id: game.id,
              competition: game.league.name,
              // On utilise le champ 'date' brut de l'API pour le helper
              date: game.date,
              status: matchStatus,
              scoreA: scoreA,
              scoreB: scoreB,
              liveMinute: liveMinute,
              teamA: game.teams.home.name,
              teamB: game.teams.away.name,
              logoA: game.teams.home.logo,
              logoB: game.teams.away.logo,
              bgImage: `https://picsum.photos/seed/${game.id}/800/600`,
              sportKey: selectedSport,
              polls: [],
            };
          });
        } else if (selectedSport === "football") {
          // --- LOGIQUE POUR LE FOOTBALL (TheSportsDB) ---
          console.log("⚽ Appel API TheSportsDB pour les matchs de Ligue 1...");
          const LEAGUE_ID_LIGUE1 = "4334";
          const response = await fetch(
            `https://www.thesportsdb.com/api/v1/json/${THESPORTSDB_KEY}/eventsnextleague.php?id=${LEAGUE_ID_LIGUE1}`
          );
          const data = await response.json();
          const apiMatches = data.events;
          if (!apiMatches)
            throw new Error(
              "L'API TheSportsDB n'a retourné aucun match de foot."
            );

          fetchedMatches = apiMatches.map((match) => ({
            id: match.idEvent,
            competition: match.strLeague,
            // 👇 CORRECTION FOOT : Assure-toi d'avoir une date complète pour le helper
            date: `${match.dateEvent}T${match.strTime || "00:00:00"}`,
            status: "SCHEDULED", // Cette API ne donne que les futurs matchs, donc SCHEDULED
            scoreA: 0,
            scoreB: 0,
            liveMinute: null,
            // ----------------------------------------
            teamA: match.strHomeTeam,
            teamB: match.strAwayTeam,
            logoA: match.strHomeTeamBadge,
            logoB: match.strAwayTeamBadge,
            bgImage: match.strThumb,
            sportKey: selectedSport,
            polls: [],
          }));
        } else {
          // Pour les autres sports (Tennis, F1), on charge le local pour l'instant
          fetchedMatches = masterSportData[selectedSport]?.matches || [];
        }

        // On simule l'engagement pour tous les matchs de l'API
        const matchesWithEngagement = fetchedMatches.map((m) => ({
          ...m,
          usersEngaged: Math.floor(Math.random() * 4000) + 500,
        }));

        const cachePayload = {
          timestamp: Date.now(),
          data: matchesWithEngagement,
        };
        localStorage.setItem(cacheKey, JSON.stringify(cachePayload));
        console.log(
          `📦 ${matchesWithEngagement.length} matchs pour ${selectedSport} mis en cache.`
        );
        setMatches(matchesWithEngagement);
      } catch (error) {
        console.warn(
          `⚠️ L'appel API pour ${selectedSport} a échoué. Fallback sur les données locales.`,
          error.message
        );
        // Utilise les données locales en cas d'échec de l'API
        setMatches(
          masterSportData[selectedSport]?.matches || fetchedMatches || []
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [selectedSport]);

  const handleSelectMatch = (match, sportKey) => {
    navigate(`/match/${sportKey}/${match.id}`, { state: { matchData: match } });
  };

  if (loading) {
    return <div className="loading">Chargement des prochains matchs...</div>;
  }

  const featuredMatch = matches.length > 0 ? matches[0] : null;
  const otherMatches = matches.length > 1 ? matches.slice(1) : [];

  return (
    <div className="lobby-final-layout">
      <div className="lobby-sidebar-left">
        <HotComments matches={matches} />
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
              <>
                <h3 className="list-title">Autres Matchs</h3>
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
                                {/* Utilisation du helper qui affiche Date, Score LIVE, ou Score FINISHED */}
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
            )}
          </>
        ) : (
          <div className="no-data">Aucun match à venir pour ce sport.</div>
        )}
      </div>
      <div className="lobby-sidebar-right">
        <HotPolls matches={matches} onSelectMatch={handleSelectMatch} />
      </div>
    </div>
  );
};

export default Lobby;
