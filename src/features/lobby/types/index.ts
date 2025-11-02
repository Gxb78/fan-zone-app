// On définit le contrat pour un objet Match
export interface Match {
  id: string;
  competition: string;
  date: string;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED';
  scoreA: number | null;
  scoreB: number | null;
  teamA: string;
  teamB: string;
  logoA?: string;
  logoB?: string;
  bgImage?: string;
  sportKey: string;
  usersEngaged?: number;
  polls?: any[]; // On affinera ce type plus tard
}