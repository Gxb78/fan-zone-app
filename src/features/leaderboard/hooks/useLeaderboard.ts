import { useState, useEffect } from "react";
import { getLeaderboard } from "@/services/firebase";

export interface LeaderboardEntry {
  userId: string;
  points: number;
  streak: number;
  accuracy: number;
}

export function useLeaderboard(isOpen: boolean) {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        // 👇 CORRECTION ICI : On "cast" les données pour rassurer TypeScript
        const data = (await getLeaderboard(10)) as LeaderboardEntry[];
        setLeaderboardData(data);
      } catch (error) {
        console.error("Erreur leaderboard:", error);
      }
      setLoading(false);
    };

    fetchLeaderboard();
  }, [isOpen]);

  return { leaderboardData, loading };
}
