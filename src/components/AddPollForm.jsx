// src/components/AddPollForm.jsx
import React, { useState } from "react";
import { addPollToMatch } from "../services/firebase";

const AddPollForm = ({ matchId }) => {
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  // On gère maintenant un tableau de chaînes de caractères simple pour l'UI
  const [options, setOptions] = useState(["", ""]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOptionField = () => {
    if (options.length < 4) {
      setOptions([...options, ""]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validOptions = options.filter((opt) => opt.trim() !== "");
    if (
      title.trim() === "" ||
      question.trim() === "" ||
      validOptions.length < 2
    ) {
      alert("Il faut un titre, une question et au moins 2 options valides !");
      return;
    }

    // 👇 MODIFICATION ICI : On transforme notre tableau simple en structure complexe
    const optionsForFirebase = validOptions.map((text, index) => ({
      // On crée une clé simple, ex: "option_1", "option_2"
      key: `option_${index + 1}`,
      text: text,
      order: index,
    }));

    const newPoll = {
      id: title.toLowerCase().replace(/\s/g, "_").slice(0, 20),
      title,
      polarizingQuestion: question,
      options: optionsForFirebase, // On envoie la nouvelle structure
    };

    try {
      await addPollToMatch(matchId, newPoll);
      alert("Sondage ajouté ! Actualise la page du match pour le voir.");
      setTitle("");
      setQuestion("");
      setOptions(["", ""]);
    } catch (error) {
      console.error("Erreur ajout sondage:", error);
      alert("Oups, une erreur est survenue.");
    }
  };

  return (
    <div className="add-poll-form-container">
      <h3>Ajouter un Sondage au Match</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre du sondage (ex: Homme du match)"
        />
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="La question qui enflamme..."
        />
        <div className="poll-options-inputs">
          {options.map((option, index) => (
            <input
              key={index}
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
            />
          ))}
        </div>
        {options.length < 4 && (
          <button
            type="button"
            onClick={addOptionField}
            className="btn-add-option"
          >
            + Ajouter une option
          </button>
        )}
        <button type="submit" className="btn-submit-poll">
          Créer le Sondage
        </button>
      </form>
    </div>
  );
};

export default AddPollForm;
