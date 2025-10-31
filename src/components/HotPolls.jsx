// src/components/HotPolls.jsx
import React from "react";
import "./HotPolls.css";

const HotPolls = ({ matches, onSelectMatch }) => {
  // On récupère tous les sondages et on les "aplatit" dans une seule liste
  const allPolls = matches.flatMap((match) =>
    // On s'assure que match et match.polls existent bien
    (match && match.polls ? match.polls : []).map((poll) => ({
      ...poll,
      match: match, // On garde une référence au match parent
    }))
  );

  // 👇 LA LOGIQUE DE TRI CORRIGÉE 👇
  // On trie les sondages en fonction du nombre de fans sur le match parent.
  // Les débats les plus chauds sont ceux des matchs les plus populaires !
  const sortedPolls = allPolls.sort((a, b) => {
    const engagementA = a.match?.usersEngaged || 0;
    const engagementB = b.match?.usersEngaged || 0;
    return engagementB - engagementA;
  });

  // On ne garde que les 3 plus chauds
  const hotPolls = sortedPolls.slice(0, 3);

  if (hotPolls.length === 0) return null;

  return (
    <div className="hot-polls-container">
      <h3 className="list-title">🔥 Les Débats du Moment</h3>
      <div className="hot-polls-grid">
        {hotPolls.map((poll) => {
          // 👇 LA SÉCURITÉ AJOUTÉE 👇
          // Ce "if" est notre garde du corps. Si un sondage ou son match parent
          // a un problème, on ne l'affiche pas et on évite le crash.
          if (!poll || !poll.match) {
            return null;
          }

          // On simule les votes pour l'affichage, car on ne les a pas ici
          const totalVotes =
            poll.match.usersEngaged > 100
              ? Math.floor(poll.match.usersEngaged / 2)
              : poll.match.usersEngaged;

          return (
            <div
              key={poll.id}
              className="hot-poll-card" // La carte parente ne bouge plus
              onClick={() => onSelectMatch(poll.match, poll.match.sportKey)}
            >
              {/* 👇 ON AJOUTE CETTE DIV INTÉRIEURE 👇 */}
              <div className="hot-poll-card-inner">
                <div className="poll-context">
                  {poll.match.teamA} vs {poll.match.teamB}
                </div>
                <h4 className="hot-poll-title">{poll.polarizingQuestion}</h4>
                <ul className="hot-poll-options simple">
                  {Object.keys(poll.options).map((optionKey) => (
                    <li key={optionKey}>
                      <span>{poll.options[optionKey]}</span>
                    </li>
                  ))}
                </ul>
                <div className="total-votes">{totalVotes} fans sur le coup</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HotPolls;
