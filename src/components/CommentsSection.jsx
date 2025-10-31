// src/components/CommentsSection.jsx
import React from "react";

const CommentsSection = ({ comments, onReply }) => {
  return (
    <div className="seed-comments-section">
      <div className="seed-title">💬 Les fans disent :</div>
      {comments.map((comment, index) => {
        // 👇 C'est cette logique qu'on remet en place !
        let badgeClass = "";
        if (comment.isControversial) {
          badgeClass = "controversial-speaker";
        } else if (comment.isOpinionLeader) {
          badgeClass = "opinion-leader";
        }

        return (
          <div key={index} className={`seed-comment ${badgeClass}`}>
            <div className="seed-comment-text">"{comment.text}"</div>
            <div className="seed-comment-engagement">
              👍 {comment.likes} j'aime
              {/* Le bouton pour répondre qu'on a ajouté */}
              <button className="reply-btn" onClick={() => onReply(comment)}>
                ↪️ Répondre
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CommentsSection;
