// src/components/Chat.jsx
import React, { useState, useEffect, useRef } from "react";
import { sendMessage, getCurrentUser } from "../services/firebase";
import db from "../services/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { timeAgo } from "../utils/helpers";
import "./Chat.css";

const Chat = ({
  matchId,
  chatId,
  onClearReply,
  replyTo,
  featuredPollData,
  otherPolls,
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const user = getCurrentUser();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!matchId || !chatId) return;

    const messagesPath = `matches/${matchId}/chats/${chatId}/messages`;
    const chatCollectionRef = collection(db, messagesPath);
    const q = query(chatCollectionRef, orderBy("timestamp"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [matchId, chatId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "" || !user || isSending) return; // Sécurité supplémentaire

    // 👇 ON BLOQUE L'ENVOI
    setIsSending(true);

    const userVoteKey = featuredPollData?.voters?.[user.uid];
    const userVoteText = userVoteKey
      ? featuredPollData.options[userVoteKey]
      : null;

    const messageData = {
      text: newMessage,
      userId: user.uid,
      quotedMessage: replyTo ? replyTo.text : null,
      pronostic: userVoteText,
    };

    try {
      await sendMessage(matchId, chatId, messageData);
      setNewMessage("");
      if (onClearReply) onClearReply();
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
    } finally {
      // 👇 ON DÉBLOQUE L'ENVOI
      setIsSending(false);
    }
  };

  const getChatTitle = () => {
    if (chatId === "general") return "Général";
    const currentPoll = otherPolls.find((p) => p.id === chatId);
    return currentPoll ? currentPoll.title : "Débat";
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>💬 Chat: {getChatTitle()}</h2>
      </div>
      <div className="messages-list">
        {messages.length === 0 ? (
          <div className="no-messages">
            Aucun message ici... Lance le débat ! 🔥
          </div>
        ) : (
          messages.map((msg) => {
            const messageType = msg.userId === user?.uid ? "sent" : "received";

            return (
              <div key={msg.id} className={`message-item ${messageType}`}>
                <div className="message-author">
                  <strong>Fan_{msg.userId.substring(0, 6)}</strong>
                  {msg.pronostic && (
                    <span className="user-pronostic-badge">
                      {msg.pronostic}
                    </span>
                  )}
                  <span className="message-time">
                    {msg.timestamp ? timeAgo(msg.timestamp.toDate()) : "..."}
                  </span>
                </div>
                <div className="message-bubble">
                  {msg.quotedMessage && (
                    <div className="quoted-message">"{msg.quotedMessage}"</div>
                  )}
                  <div className="message-text">{msg.text}</div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 👇 LE FORMULAIRE EST DE RETOUR ! 👇 */}
      <form className="chat-form" onSubmit={handleSendMessage}>
        {replyTo && (
          <div className="reply-preview">
            <span>Réponse à : "{replyTo.text.substring(0, 30)}..."</span>
            <button type="button" onClick={onClearReply}>
              ✕
            </button>
          </div>
        )}
        <div className="chat-input-wrapper">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ton analyse, ton pronostic..."
            disabled={isSending} // Désactive aussi l'input pendant l'envoi
          />
          <button type="submit" disabled={isSending}>
            {isSending ? "Envoi..." : "Envoyer"}
          </button>
        </div>
      </form> 
    </div>
  );
};

Chat.defaultProps = {
  otherPolls: [],
};

export default Chat;
