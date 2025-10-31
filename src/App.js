// src/App.js
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import React, { useState, useEffect } from "react";
import Lobby from "./components/Lobby";
import FanZone from "./components/FanZone";
import UserStats from "./components/UserStats";
import Leaderboard from "./components/Leaderboard";
import Admin from "./pages/Admin";
import { signInUser, initializeUserStats } from "./services/firebase";
import masterSportData from "./data/masterSportData";
import "./App.css";

// --- COMPOSANT POUR LE CONTENU DE L'APP ---
// On le sort de la fonction App pour une structure plus propre.
const AppContent = () => {
  const [userStatsOpen, setUserStatsOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const location = useLocation(); // Hook pour connaître l'URL actuelle
  const navigate = useNavigate(); // Hook pour pouvoir changer de page

  // On vérifie si on est sur une page de match
  const isMatchPage = location.pathname.startsWith("/match/");

  // On prépare les données des matchs une seule fois ici
  const allMatches = Object.values(masterSportData).flatMap(
    (sport) => sport.matches
  );

  return (
    <div className="App">
      <div className="app-container">
        <div className="app-navbar">
          <div className="navbar-left">
            {/* Si on est sur une page de match, on affiche le bouton "Retour" */}
            {isMatchPage && (
              <button className="navbar-btn-back" onClick={() => navigate(-1)}>
                ←
              </button>
            )}
            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
              <h1 className="navbar-logo">🔥 Fan Zone</h1>
            </Link>
          </div>
          <div className="navbar-right">
            <Link to="/admin" className="navbar-btn admin-link">
              Admin
            </Link>
            <button
              className="navbar-btn"
              onClick={() => setUserStatsOpen(true)}
            >
              📊 Mes Stats
            </button>
            <button
              className="navbar-btn"
              onClick={() => setLeaderboardOpen(true)}
            >
              🏆 Leaderboard
            </button>
          </div>
        </div>

        <div className="app-content">
          <Routes>
            <Route path="/" element={<Lobby />} />
            <Route
              path="/match/:sportKey/:matchId"
              element={<FanZone allMatches={allMatches} />}
            />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      </div>

      {/* Les modales restent ici pour flotter par-dessus tout */}
      <UserStats
        isOpen={userStatsOpen}
        onClose={() => setUserStatsOpen(false)}
      />
      <Leaderboard
        isOpen={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
      />
    </div>
  );
};

// --- COMPOSANT PRINCIPAL APP ---
// Son seul rôle est d'initialiser Firebase et de mettre en place le Router.
function App() {
  useEffect(() => {
    // Connexion anonyme de l'utilisateur au chargement
    signInUser((authenticatedUser) => {
      if (authenticatedUser) {
        initializeUserStats(authenticatedUser.uid);
      }
    });
  }, []);

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
