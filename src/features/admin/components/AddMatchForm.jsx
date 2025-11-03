import React, { useState } from "react";
// 👇 Imports corrigés avec les alias
import { TEAMS } from "@/data/teamData";
import { addMatch } from "@/services/firebase";

const AddMatchForm = () => {
  // ... (le reste du composant est identique)
  const [sport, setSport] = useState("football");
  const [teamA, setTeamA] = useState(TEAMS.football[0].name);
  const [teamB, setTeamB] = useState(TEAMS.football[1].name);
  const [competition, setCompetition] = useState("Ligue 1");
  const [time, setTime] = useState("21:00");
  const [bgImage, setBgImage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teamA || !teamB || !competition || !time) {
      alert("Remplis tous les champs stp !");
      return;
    }
    const teamAData = TEAMS[sport].find((t) => t.name === teamA);
    const teamBData = TEAMS[sport].find((t) => t.name === teamB);
    if (!teamAData || !teamBData) {
      alert("Une des équipes sélectionnées n'est pas valide.");
      return;
    }
    const matchData = {
      sportKey: sport,
      teamA: teamAData.name,
      logoA: teamAData.logo,
      teamB: teamBData.name,
      logoB: teamBData.logo,
      competition,
      time,
      bgImage,
      usersEngaged: 0,
      polls: [],
    };
    try {
      await addMatch(matchData);
      alert("Match ajouté avec succès ! 🔥");
    } catch (error) {
      console.error("Erreur lors de l'ajout du match:", error);
      alert("Oups, une erreur est survenue.");
    }
  };

  const handleSportChange = (e) => {
    const newSport = e.target.value;
    setSport(newSport);
    const newTeamList = TEAMS[newSport] || [];
    if (newTeamList.length >= 2) {
      setTeamA(newTeamList[0].name);
      setTeamB(newTeamList[1].name);
    } else if (newTeamList.length === 1) {
      setTeamA(newTeamList[0].name);
      setTeamB("");
    } else {
      setTeamA("");
      setTeamB("");
    }
  };
  const teamList = TEAMS[sport] || [];

  return (
    <div className="add-match-form-container">
      <h2>Ajouter un Nouveau Match</h2>
      <form onSubmit={handleSubmit}>
        <select value={sport} onChange={handleSportChange}>
          <option value="football">Football</option>
          <option value="basketball">Basketball</option>
          <option value="tennis">Tennis</option>
          <option value="f1">Formule 1</option>
        </select>
        <select value={teamA} onChange={(e) => setTeamA(e.target.value)}>
          {teamList.map((team) => (
            <option key={team.name} value={team.name}>
              {team.name}
            </option>
          ))}
        </select>
        <select value={teamB} onChange={(e) => setTeamB(e.target.value)}>
          {teamList.map((team) => (
            <option key={team.name} value={team.name}>
              {team.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={competition}
          onChange={(e) => setCompetition(e.target.value)}
          placeholder="Compétition"
        />
        <input
          type="text"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          placeholder="Heure (ex: 21:00)"
        />
        <input
          type="text"
          value={bgImage}
          onChange={(e) => setBgImage(e.target.value)}
          placeholder="URL Image de fond (optionnel)"
        />
        <button type="submit">Créer le Match</button>
      </form>
    </div>
  );
};

export default AddMatchForm;
