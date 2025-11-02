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
  limit,
  updateDoc,
  increment,
} from "firebase/firestore";

import { generateRageBaitContent } from "./aiContentGenerator";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// 👇 MODIFICATION ICI : On exporte 'auth' pour le rendre disponible
export const auth = getAuth(app);

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

// ... (le reste du fichier ne change pas) ...

// ===============================================
// FONCTION UTILITAIRE POUR CRÉER LES SONDAGES (via l'IA)
// ===============================================
async function addDefaultPollsToMatch(matchData) {
  // ... (Le reste de cette fonction est déjà bon, on ne change rien)
  const { polls } = generateRageBaitContent(matchData);
  const { id: matchId, teamA, teamB } = matchData;

  if (!polls || polls.length === 0) return;

  for (const poll of polls) {
    const pollRef = doc(db, "matches", String(matchId), "polls", poll.id);
    const { seedVotes, ...pollData } = poll;
    await setDoc(pollRef, {
      ...pollData,
      votes: {},
      voters: {},
    });
  }
  console.log(
    `🤖 IA RageBait: ${polls.length} débats générés pour le match ${matchId}`
  );

  for (const poll of polls) {
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
// MATCHES & POLLS 🗳️
// ===============================================
export async function getOrCreateMatch(apiMatch) {
  // ... (Cette fonction reste inchangée)
  const matchId = String(apiMatch.id);
  const matchRef = doc(db, "matches", matchId);
  const matchSnap = await getDoc(matchRef);

  const freshApiData = {
    ...apiMatch,
    id: matchId,
    sportKey: apiMatch.sportKey || "football",
  };
  delete freshApiData.polls;

  if (!matchSnap.exists()) {
    console.log(
      `🔥 Match ${matchId} non trouvé. Création et génération par IA...`
    );
    await setDoc(matchRef, freshApiData);
    await addDefaultPollsToMatch(freshApiData);
    return freshApiData;
  } else {
    console.log(
      `🔄️ Match ${matchId} trouvé. Mise à jour avec les données fraîches de l'API...`
    );
    await setDoc(matchRef, freshApiData, { merge: true });

    const matchDataFromDb = matchSnap.data();
    const pollsCollectionRef = collection(db, "matches", matchId, "polls");
    const pollsSnapshot = await getDocs(query(pollsCollectionRef, limit(1)));
    if (pollsSnapshot.empty) {
      console.warn(
        `⚠️ Match ${matchId} trouvé sans sondages. Réparation par IA...`
      );
      await addDefaultPollsToMatch(freshApiData);
    }
    return { ...matchDataFromDb, ...freshApiData };
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
  let isNewVote = false; // On va tracker si c'est un premier vote

  await runTransaction(db, async (transaction) => {
    const pollDoc = await transaction.get(pollRef);
    if (!pollDoc.exists())
      throw new Error("Le document du sondage n'existe pas !");

    const pollData = pollDoc.data();
    const votes = pollData.votes || {};
    const voters = pollData.voters || {};
    const previousVote = voters[userId];

    isNewVote = !previousVote; // C'est un nouveau vote s'il n'y avait pas de vote précédent

    if (previousVote && previousVote !== userChoice) {
      votes[previousVote] = (votes[previousVote] || 1) - 1;
    }
    if (!previousVote || previousVote !== userChoice) {
      votes[userChoice] = (votes[userChoice] || 0) + 1;
    }
    voters[userId] = userChoice;
    transaction.update(pollRef, { votes, voters, lastActivity: Date.now() });
  });

  // ✨ NOUVEAUTÉ ENGAGEMENT : On met à jour les stats de l'utilisateur APRÈS la transaction
  if (isNewVote) {
    await updateUserStatsOnVote(userId);
  }
}

export async function cancelVotePoll(pollDbPath, userId) {
  // ... (Cette fonction reste inchangée)
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
// ADMIN & CHAT & STATS
// ===============================================
export async function getAllMatches() {
  // ... (inchangé)
  const q = query(collection(db, "matches"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addMatch(matchData) {
  // ... (inchangé)
  const matchId = `${matchData.teamA.replace(
    /\s/g,
    ""
  )}_${matchData.teamB.replace(/\s/g, "")}_${Date.now()}`;
  const matchRef = doc(db, "matches", matchId);
  await setDoc(matchRef, { ...matchData, id: matchId });
  await addDefaultPollsToMatch({ ...matchData, id: matchId });
}

export async function addPollToMatch(matchId, newPoll) {
  // ... (inchangé)
  if (!matchId || !newPoll.id) throw new Error("Données du sondage invalides.");
  const pollRef = doc(db, "matches", matchId, "polls", newPoll.id);
  await setDoc(pollRef, { ...newPoll, votes: {}, voters: {} });
}

export async function deleteMatch(matchId) {
  // ... (inchangé)
  if (!matchId)
    throw new Error("Un ID de match est requis pour la suppression.");
  console.log(
    `🗑️ Début du processus de suppression pour le match ${matchId}...`
  );
  try {
    const pollsRef = collection(db, "matches", matchId, "polls");
    const pollsSnapshot = await getDocs(pollsRef);
    for (const pollDoc of pollsSnapshot.docs) {
      await deleteDoc(doc(db, "matches", matchId, "polls", pollDoc.id));
    }
    await deleteDoc(doc(db, "matches", matchId));
    console.log(
      `✅ Match ${matchId} et ses données ont été supprimés avec succès.`
    );
  } catch (error) {
    console.error(
      `Erreur critique lors de la suppression du match ${matchId}:`,
      error
    );
    throw new Error(`Échec de la suppression pour le match ${matchId}.`);
  }
}

export async function sendMessage(matchId, chatId, messageData) {
  // ... (inchangé)
  const messagesPath = `matches/${matchId}/chats/${chatId}/messages`;
  const chatCollectionRef = collection(db, messagesPath);
  await addDoc(chatCollectionRef, {
    ...messageData,
    timestamp: serverTimestamp(),
  });
}

export function subscribeToUserStats(userId, onData) {
  // ... (inchangé)
  const userStatsRef = doc(db, "userStats", userId);
  return onSnapshot(userStatsRef, (snapshot) => {
    if (snapshot.exists()) {
      onData(snapshot.data());
    } else {
      onData({ points: 0, badges: [], accuracy: 0 });
    }
  });
}

export async function initializeUserStats(userId) {
  // ... (inchangé)
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

// ✨ NOUVELLE FONCTION D'ENGAGEMENT
// Met à jour les stats d'un utilisateur après un vote
async function updateUserStatsOnVote(userId) {
  if (!userId) return;
  const userStatsRef = doc(db, "userStats", userId);
  try {
    // On incrémente le total des votes et on ajoute des points
    await updateDoc(userStatsRef, {
      totalVotes: increment(1),
      points: increment(5), // +5 points pour chaque vote
    });
  } catch (error) {
    console.error(
      `Impossible de mettre à jour les stats pour l'utilisateur ${userId}:`,
      error
    );
    // On ne bloque pas l'UI pour ça, c'est une opération en arrière-plan.
  }
}

export async function getLeaderboard(limitCount = 10) {
  // ... (inchangé)
  const q = query(
    collection(db, "userStats"),
    orderBy("points", "desc"),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ userId: d.id, ...d.data() }));
}

export async function addReactionToMessage(
  matchId,
  chatId,
  messageId,
  reactionEmoji
) {
  const messageRef = doc(
    db,
    "matches",
    matchId,
    "chats",
    chatId,
    "messages",
    messageId
  );

  await runTransaction(db, async (transaction) => {
    const messageDoc = await transaction.get(messageRef);
    if (!messageDoc.exists()) {
      // 👇 CORRECTION ICI 👇
      throw new Error("Ce message n'existe pas !");
    }
    const reactionField = `reactions.${reactionEmoji}`;
    transaction.update(messageRef, { [reactionField]: increment(1) });
  });
}

export default db;
