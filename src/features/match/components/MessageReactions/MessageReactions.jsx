// src/components/MessageReactions.jsx
import React from 'react';
import './MessageReactions.css';

// On définit nos réactions ici pour pouvoir les changer facilement
export const REACTIONS = {
  fire: "🔥",
  clap: "👏",
  laugh: "😂",
  wow: "😮",
};

const MessageReactions = ({ message, matchId, chatId, onAddReaction }) => {
  return (
    <div className="reactions-container">
      {Object.entries(REACTIONS).map(([key, emoji]) => (
        <button 
          key={key} 
          className="reaction-button"
          onClick={() => onAddReaction(message.id, key)}
          title={`Réagir avec ${emoji}`}
        >
          {emoji}
          {/* On affiche le compteur s'il existe */}
          {message.reactions?.[key] > 0 && (
            <span className="reaction-count">{message.reactions[key]}</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default MessageReactions;