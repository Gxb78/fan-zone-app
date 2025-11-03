import React, { useState, useRef, useEffect } from "react";
import {
  sendMessage,
  getCurrentUser,
  addReactionToMessage,
} from "@/services/firebase";
import { useChatSubscription } from "../../hooks/useChatSubscription";
import { timeAgo } from "@/utils/helpers";
import MessageReactions from "../MessageReactions/MessageReactions";
import "./Chat.css";

const Chat = ({ matchId, chatId, featuredPollData }) => {
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const user = getCurrentUser();
  const messagesEndRef = useRef(null);

  // 👇 Notre hook fait tout le travail de récupération des messages !
  const messages = useChatSubscription(matchId, chatId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "" || !user || isSending) return;
    setIsSending(true);

    const userVoteKey = featuredPollData?.voters?.[user.uid];
    let userVoteText = null;
    if (userVoteKey && Array.isArray(featuredPollData.options)) {
      const voteOption = featuredPollData.options.find(
        (opt) => opt.key === userVoteKey
      );
      userVoteText = voteOption?.text;
    }

    const messageData = {
      text: newMessage,
      userId: user.uid,
      pronostic: userVoteText,
      reactions: {},
    };

    try {
      await sendMessage(matchId, chatId, messageData);
      setNewMessage("");
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleAddReaction = async (messageId, reactionEmoji) => {
    try {
      await addReactionToMessage(matchId, chatId, messageId, reactionEmoji);
    } catch (error) {
      console.error("Erreur en ajoutant la réaction:", error);
    }
  };

  const getChatTitle = () => {
    if (chatId === "general") return "Général";
    return featuredPollData?.title || "Débat";
  };

  return (
    // 👇 TOUT LE JSX MANQUANT EST DE RETOUR ICI 👇
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
                <MessageReactions
                  message={msg}
                  matchId={matchId}
                  chatId={chatId}
                  onAddReaction={handleAddReaction}
                />
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-form" onSubmit={handleSendMessage}>
        <div className="chat-input-wrapper">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ton analyse, ton pronostic..."
            disabled={isSending}
          />
          <button type="submit" disabled={isSending}>
            {isSending ? "..." : "Envoyer"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
