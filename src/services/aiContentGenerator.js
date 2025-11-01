// src/services/aiContentGenerator.js

// Notre collection de punchlines "RageBait" par catégorie
const RAGEBAIT_TEMPLATES = {
  overconfidence: [
    "L'équipe de {teamB} ? C'est juste un entraînement pour nos attaquants, rien de plus.",
    "{teamA} va plier ce match en une mi-temps. Le suspense a duré 2 minutes.",
    "Honnêtement, je suis déjà en train de penser au match de la semaine prochaine. Celui-ci est déjà gagné pour {teamA}.",
  ],
  playerTaunts: [
    "Le gardien de {teamB} a des mains en savon, c'est pas possible autrement. J'annonce une boulette.",
    "J'espère que l'attaquant de {teamA} a mis les bons crampons, la dernière fois il passait son temps à glisser.",
    "Le milieu de terrain de {teamB} court moins vite que ma grand-mère avec son déambulateur.",
  ],
  memeCulture: [
    "La défense de {teamA}, c'est une porte de saloon, ça s'ouvre dans les deux sens.",
    "Voir {teamB} essayer de construire une attaque, c'est comme regarder un épisode de 'C'est pas sorcier' sur comment rater une passe.",
    "Je suis sûr que l'entraîneur de {teamB} a trouvé sa tactique dans un biscuit chinois.",
  ],
  pessimism: [
    "Préparez les coussins, j'annonce le 0-0 le plus ennuyeux de l'année. Zéro prise de risque, zéro spectacle.",
    "Ce match a le potentiel d'endormir un insomniaque sous caféine. Bravo la programmation.",
    "J'ai vu des parties de curling plus intenses que ce qui nous attend ce soir.",
  ],
};

// Fonction pour choisir aléatoirement des punchlines et les formater
function generateSeedComments(teamA, teamB) {
  const allTemplates = [
    ...RAGEBAIT_TEMPLATES.overconfidence,
    ...RAGEBAIT_TEMPLATES.playerTaunts,
    ...RAGEBAIT_TEMPLATES.memeCulture,
    ...RAGEBAIT_TEMPLATES.pessimism,
  ];

  const shuffled = allTemplates.sort(() => 0.5 - Math.random());

  // On prend 4 commentaires pour plus de vie
  return shuffled.slice(0, 4).map((template, index) => {
    // On remplace les {teamA} et {teamB} par les vrais noms
    const text = template.replace(/{teamA}/g, teamA).replace(/{teamB}/g, teamB);
    return {
      text,
      author: `Fan_Analyst_${Math.floor(Math.random() * 900) + 100}`,
      likes: Math.floor(Math.random() * 40) + 5,
      isControversial: index % 2 === 0,
      isOpinionLeader: index === 0,
    };
  });
}

// La fonction principale qu'on exportera. Elle génère TOUT le contenu d'un match.
export function generateRageBaitContent(match) {
  const { teamA, teamB } = match;

  const polls = [
    {
      id: "vainqueur_match",
      title: "Vainqueur du Match",
      polarizingQuestion: `Qui va remporter le choc entre ${teamA} et ${teamB} ?`,
      options: [
        { key: "teamA", text: teamA, order: 0 },
        { key: "draw", text: "Match Nul", order: 1 },
        { key: "teamB", text: teamB, order: 2 },
      ],
      seedComments: generateSeedComments(teamA, teamB).slice(0, 2), // On prend 2 commentaires pour ce sondage
    },
    {
      id: "homme_du_match",
      title: "Homme du Match",
      polarizingQuestion: "Le MVP viendra de quelle équipe selon toi ?",
      options: [
        { key: "joueurA", text: `Un joueur de ${teamA}`, order: 0 },
        { key: "joueurB", text: `Un joueur de ${teamB}`, order: 1 },
      ],
      seedComments: generateSeedComments(teamA, teamB).slice(2, 4), // On prend les 2 autres pour celui-ci
    },
  ];

  return { polls };
}
