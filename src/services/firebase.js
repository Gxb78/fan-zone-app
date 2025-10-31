// src/services/firebase.js

// Import Firebase v9 Modular
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getFirestore,
  doc,
  runTransaction,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  limit, // On importe "limit" pour le leaderboard
} from "firebase/firestore";

// ⚡️ Configure ici tes données Firebase projet
const firebaseConfig = {
  apiKey: "AIzaSyDWcubMybHp7UZZhmB8obZL4EixPPb59BY",
  authDomain: "fan-zone-610dd.firebaseapp.com",
  projectId: "fan-zone-610dd",
  storageBucket: "fan-zone-610dd.appspot.com",
  messagingSenderId: "367017224731",
  appId: "1:367017224731:web:cb1d2ae2a828e17c3426be",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ===============================================
// AUTH & USER 👤
// ===============================================
export function signInUser(callback) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      callback(user);
    } else {
      signInAnonymously(auth).catch((error) =>
        console.error("Auth Error", error)
      );
    }
  });
}

export function getCurrentUser() {
  return auth.currentUser;
}

// ===============================================
// FONCTION UTILITAIRE POUR CRÉER LES SONDAGES
// ===============================================
async function addDefaultPollsToMatch(matchData) {
  let defaultPolls = [];
  const { teamA, teamB, id: matchId, sportKey } = matchData;

  // --- Scénario pour le Football ---
  if (sportKey === "football") {
    defaultPolls = [
      {
        id: "vainqueur_match",
        title: "Vainqueur du Match",
        polarizingQuestion: `Qui va remporter le choc entre ${teamA} et ${teamB} ?`,
        options: { teamA: teamA, draw: "Match Nul", teamB: teamB },
        // On génère des votes aléatoires mais crédibles
        seedVotes: {
          teamA: Math.floor(Math.random() * 2000) + 500,
          draw: Math.floor(Math.random() * 800) + 200,
          teamB: Math.floor(Math.random() * 2000) + 400,
        },
      },
      {
        id: "homme_du_match",
        title: "Homme du Match",
        polarizingQuestion: "Le MVP viendra de quelle équipe selon toi ?",
        options: {
          joueurA: `Un joueur de ${teamA}`,
          joueurB: `Un joueur de ${teamB}`,
        },
        seedVotes: {
          joueurA: Math.floor(Math.random() * 1500) + 300,
          joueurB: Math.floor(Math.random() * 1500) + 300,
        },
      },
    ];
  }
  // --- Scénario pour le Basketball ---
  else if (sportKey === "basketball") {
    defaultPolls = [
      {
        id: "vainqueur_match",
        title: "Vainqueur du Match",
        polarizingQuestion: `Qui va dominer le parquet entre ${teamA} et ${teamB} ?`,
        options: { teamA: teamA, teamB: teamB },
        seedVotes: {
          teamA: Math.floor(Math.random() * 2500) + 500,
          teamB: Math.floor(Math.random() * 2500) + 500,
        },
      },
    ];
  }

  if (defaultPolls.length === 0) return;

  // On crée un document pour chaque sondage généré
  for (const poll of defaultPolls) {
    const pollRef = doc(db, "matches", String(matchId), "polls", poll.id);
    const { seedVotes, ...pollData } = poll;
    const seedComments = generateSeedComments(poll.title, teamA, teamB);
    await setDoc(pollRef, {
      ...pollData,
      votes: seedVotes || {},
      voters: {},
      seedComments: seedComments,
    });
  }
  console.log(
    `🤖 IA: ${defaultPolls.length} débats générés pour le match ${matchId}`
  );

  // 👇 NOUVEAU : On génère un message pour CHAQUE nouveau chat de sondage
  for (const poll of defaultPolls) {
    const pollChatRef = collection(
      db,
      "matches",
      String(matchId),
      "chats",
      poll.id,
      "messages"
    );
    await addDoc(pollChatRef, {
      text: `Ouverture du débat sur: "${poll.polarizingQuestion}"`,
      userId: "ia_host",
      timestamp: serverTimestamp(),
    });
  }

  // On génère aussi quelques faux messages dans le chat général
  const generalChatRef = collection(
    db,
    "matches",
    String(matchId),
    "chats",
    "general",
    "messages"
  );
  await addDoc(generalChatRef, {
    text: `Alors l'équipe, qui voit ${teamA} gagner ce soir ? Perso j'y crois !`,
    userId: "ia_fan_1",
    timestamp: serverTimestamp(),
  });
  await addDoc(generalChatRef, {
    text: `Attention à ${teamB}, ils sont capables de tout. Match très serré en perspective !`,
    userId: "ia_fan_2",
    timestamp: serverTimestamp(),
  });
}

// ===============================================
// MATCHES & POLLS 🗳️ (LA VERSION FINALE AUTO-RÉPARATRICE)
// ===============================================
export async function getOrCreateMatch(apiMatch) {
  const matchId = String(apiMatch.id);
  const matchRef = doc(db, "matches", matchId);
  const matchSnap = await getDoc(matchRef);
  const matchDataWithKey = {
    ...apiMatch,
    sportKey: apiMatch.sportKey || "football",
  };

  if (!matchSnap.exists()) {
    console.log(
      `🔥 Match ${matchId} non trouvé. Création et génération par IA...`
    );
    const { polls, ...matchData } = matchDataWithKey;
    await setDoc(matchRef, { ...matchData, id: matchId });
    // On appelle notre IA avec toutes les infos du match
    await addDefaultPollsToMatch({ ...matchData, id: matchId });
    return { ...matchData, id: matchId };
  } else {
    console.log(`✅ Match ${matchId} trouvé dans Firebase.`);
    const matchData = matchSnap.data();

    // 👇 NOTRE MAGIE AUTO-RÉPARATRICE EST ICI 👇
    const pollsCollectionRef = collection(db, "matches", matchId, "polls");
    const pollsSnapshot = await getDocs(query(pollsCollectionRef, limit(1)));
    if (pollsSnapshot.empty) {
      console.warn(
        `⚠️ Match ${matchId} trouvé sans sondages. Réparation par IA...`
      );
      // On appelle l'IA aussi pour réparer les anciens matchs
      await addDefaultPollsToMatch(matchData);
    }

    return matchData;
  }
}

export async function getPollsForMatch(matchId) {
  const pollsCollectionRef = collection(db, "matches", matchId, "polls");
  const snapshot = await getDocs(pollsCollectionRef);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function subscribeToPoll(pollDbPath, onData) {
  return onSnapshot(doc(db, ...pollDbPath), (snapshot) => {
    onData(snapshot.exists() ? snapshot.data() : null);
  });
}

export async function votePoll(pollDbPath, userChoice, userId) {
  const pollRef = doc(db, ...pollDbPath);
  await runTransaction(db, async (transaction) => {
    const pollDoc = await transaction.get(pollRef);
    if (!pollDoc.exists())
      throw new Error("Le document du sondage n'existe pas !"); // Correction ESLint

    const pollData = pollDoc.data();
    const votes = pollData.votes || {};
    const voters = pollData.voters || {};
    const previousVote = voters[userId];

    if (previousVote && previousVote !== userChoice) {
      votes[previousVote] = (votes[previousVote] || 1) - 1;
    }
    if (!previousVote || previousVote !== userChoice) {
      votes[userChoice] = (votes[userChoice] || 0) + 1;
    }

    voters[userId] = userChoice;
    transaction.update(pollRef, { votes, voters, lastActivity: Date.now() });
  });
}

export async function cancelVotePoll(pollDbPath, userId) {
  const pollRef = doc(db, ...pollDbPath);
  await runTransaction(db, async (transaction) => {
    const pollDoc = await transaction.get(pollRef);
    if (!pollDoc.exists()) return;

    const pollData = pollDoc.data();
    const votes = pollData.votes || {};
    const voters = pollData.voters || {};
    const previousVote = voters[userId];

    if (previousVote) {
      votes[previousVote] = Math.max(0, (votes[previousVote] || 1) - 1);
      delete voters[userId];
    }
    transaction.update(pollRef, { votes, voters });
  });
}

// ===============================================
// ADMIN & CHAT & STATS (Pas de changements ici)
// ===============================================

export async function getAllMatches() {
  const q = query(collection(db, "matches"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addMatch(matchData) {
  const matchId = `${matchData.teamA.replace(
    /\s/g,
    ""
  )}_${matchData.teamB.replace(/\s/g, "")}_${Date.now()}`;
  const matchRef = doc(db, "matches", matchId);
  await setDoc(matchRef, { ...matchData, id: matchId });
  await addDefaultPollsToMatch({ ...matchData, id: matchId });
}

export async function addPollToMatch(matchId, newPoll) {
  if (!matchId || !newPoll.id) throw new Error("Données du sondage invalides.");
  const pollRef = doc(db, "matches", matchId, "polls", newPoll.id);
  await setDoc(pollRef, { ...newPoll, votes: {}, voters: {} });
}

/**
 * Supprime un match ET ses sondages.
 */
export async function deleteMatch(matchId) {
  if (!matchId)
    throw new Error("Un ID de match est requis pour la suppression.");

  console.log(
    `🗑️ Début du processus de suppression pour le match ${matchId}...`
  );

  try {
    // Étape 1: Supprimer tous les sondages dans la subcollection "polls"
    const pollsRef = collection(db, "matches", matchId, "polls");
    const pollsSnapshot = await getDocs(pollsRef);

    if (!pollsSnapshot.empty) {
      for (const pollDoc of pollsSnapshot.docs) {
        // On utilise le chemin explicite pour garantir la suppression
        const pollDocRef = doc(db, "matches", matchId, "polls", pollDoc.id);
        await deleteDoc(pollDocRef);
        console.log(`--- Sondage supprimé: ${pollDoc.id}`);
      }
    } else {
      console.log(
        `--- Aucune subcollection de sondages trouvée pour le match ${matchId}. OK.`
      );
    }

    // Étape 2: Supprimer le document principal du match
    const matchRef = doc(db, "matches", matchId);
    await deleteDoc(matchRef);

    console.log(
      `✅ Match ${matchId} et ses données ont été supprimés avec succès.`
    );
  } catch (error) {
    console.error(
      `Erreur critique lors de la suppression du match ${matchId}:`,
      error
    );
    // On doit peut-être vider le cache local du navigateur si le problème persiste
    throw new Error(`Échec de la suppression pour le match ${matchId}.`);
  }
}

export async function sendMessage(matchId, chatId, messageData) {
  const messagesPath = `matches/${matchId}/chats/${chatId}/messages`;
  const chatCollectionRef = collection(db, messagesPath);
  await addDoc(chatCollectionRef, {
    ...messageData,
    timestamp: serverTimestamp(),
  });
}

export function subscribeToUserStats(userId, onData) {
  const userStatsRef = doc(db, "userStats", userId);
  return onSnapshot(userStatsRef, (snapshot) => {
    if (snapshot.exists()) {
      onData(snapshot.data());
    } else {
      onData({ points: 0, badges: [], accuracy: 0 }); // Fallback
    }
  });
}

export async function initializeUserStats(userId) {
  const userStatsRef = doc(db, "userStats", userId);
  const docSnap = await getDoc(userStatsRef);
  if (!docSnap.exists()) {
    await setDoc(userStatsRef, {
      points: 0,
      badges: [],
      accuracy: 0,
      streak: 0,
      totalVotes: 0,
      createdAt: serverTimestamp(),
    });
  }
}

export async function getLeaderboard(limitCount = 10) {
  const q = query(
    collection(db, "userStats"),
    orderBy("points", "desc"),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ userId: d.id, ...d.data() }));
}

// ============== NOUVELLE FONCTION UTILITAIRE DE SEEDING ==============
function generateSeedComments(pollTitle, teamA, teamB) {
  const comments = [
    // Opinion forte pour l'équipe A
    {
      text: `Pas de surprise, ${teamA} va plier le match en première mi-temps. C'est trop facile !`,
      author: `Fan${teamA.replace(/\s/g, "")}`,
      likes: Math.floor(Math.random() * 90) + 15,
      isOpinionLeader: true,
      isControversial: false,
    },
    // Opinion forte pour l'équipe B
    {
      text: `Tout le monde sous-estime ${teamB}. Ce soir, c'est la masterclass. J'annonce l'exploit !`,
      author: `UltiFan${teamB.replace(/\s/g, "")}`,
      likes: Math.floor(Math.random() * 70) + 10,
      isOpinionLeader: false,
      isControversial: false,
    },
    // Opinion plus rare/controversée (pour tester le badge ⚡)
    {
      text: `Je sens un match nul très fermé. Zéro but. Personne n'ose attaquer. Opinion impopulaire, je sais.`,
      author: "MrX",
      likes: Math.floor(Math.random() * 15) + 3,
      isOpinionLeader: false,
      isControversial: true,
    },
  ];
  return comments.slice(0, 3); // On renvoie les 3 meilleurs
}

export default db;
