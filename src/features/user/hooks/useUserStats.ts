import { useState, useEffect } from "react";
import { getCurrentUser, subscribeToUserStats } from "@/services/firebase";

export interface UserStatsData {
  totalVotes: number;
  correctPredictions: number;
  streak: number;
  points: number;
  badges: string[];
  accuracy: number;
}

export function useUserStats(isOpen: boolean) {
  const [stats, setStats] = useState<UserStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();

  useEffect(() => {
    if (!isOpen || !user) return;

    setLoading(true);
    // 👇 On type explicitement le paramètre 'newStats' pour satisfaire TypeScript
    const unsubscribe = subscribeToUserStats(
      user.uid,
      (newStats: UserStatsData) => {
        setStats(newStats);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isOpen, user]);

  return { stats, loading };
}
