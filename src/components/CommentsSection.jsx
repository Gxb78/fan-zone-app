// src/components/CommentsSection.jsx
import React from "react";
// 👇 On importe notre nouveau fichier CSS
import "./CommentsSection.css";

const CommentsSection = ({ comments, onReply }) => {
  return (
    <div className="seed-comments-section">
      <div className="seed-title">💬 Les fans disent :</div>
      {comments.map((comment, index) => {
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
