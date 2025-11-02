import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/services/firebase";

export interface Message {
  id: string;
  text: string;
  userId: string;
  timestamp: any;
  quotedMessage?: string | null;
  pronostic?: string | null;
  reactions?: { [key: string]: number };
}

export function useChatSubscription(matchId: string, chatId: string) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!matchId || !chatId) return;

    const messagesPath = `matches/${matchId}/chats/${chatId}/messages`;
    const q = query(collection(db, messagesPath), orderBy("timestamp"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Message)
      );
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [matchId, chatId]);

  return messages;
}
