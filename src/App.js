import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { useState } from "react";

// 👇 TOUS LES IMPORTS SONT MAINTENANT PROPRES ET POINTENT VERS LES FEATURES 👇
import Lobby from "@/features/lobby/components/Lobby/Lobby";
import MatchPage from "@/features/match/components/MatchPage/MatchPage";
import UserStats from "@/features/user/components/UserStats/UserStats";
// 👇 CORRECTION ICI : L'import est maintenant en minuscules, comme notre dossier
import Leaderboard from "@/features/leaderboard/components/Leaderboard/Leaderboard";
import Admin from "@/pages/Admin";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import Header from "@/components/layout/Header";
import { useAuth } from "@/features/auth/hooks/useAuth";

import "./App.css";
import "@/components/layout/Header.css";

export const AppContent = () => {
  const [userStatsOpen, setUserStatsOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);

  return (
    <div className="App">
      <div className="app-container">
        <Header
          onOpenStats={() => setUserStatsOpen(true)}
          onOpenLeaderboard={() => setLeaderboardOpen(true)}
        />
        <div className="app-content">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Lobby />} />
              <Route path="/match/:sportKey/:matchId" element={<MatchPage />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </ErrorBoundary>
        </div>
      </div>
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

function App() {
  const { loading } = useAuth();
  if (loading) {
    return <div className="loading">Chargement de la Fan Zone...</div>;
  }
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
