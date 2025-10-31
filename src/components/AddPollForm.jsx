// src/components/AddPollForm.jsx
import React, { useState } from "react";
import { addPollToMatch } from "../services/firebase";

const AddPollForm = ({ matchId }) => {
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]); // Commence avec 2 options

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOptionField = () => {
    if (options.length < 4) {
      // On limite à 4 options max pour garder ça simple
      setOptions([...options, ""]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // On filtre les options vides
    const validOptions = options.filter((opt) => opt.trim() !== "");
    if (
      title.trim() === "" ||
      question.trim() === "" ||
      validOptions.length < 2
    ) {
      alert("Il faut un titre, une question et au moins 2 options valides !");
      return;
    }

    // On transforme notre tableau d'options en objet, comme attendu par Firebase
    const optionsObject = {};
    validOptions.forEach((opt, index) => {
      optionsObject[`option${index + 1}`] = opt;
    });

    const newPoll = {
      id: title.toLowerCase().replace(/\s/g, "_"), // Crée un ID simple
      title,
      polarizingQuestion: question,
      options: optionsObject,
    };

    try {
      await addPollToMatch(matchId, newPoll);
      alert("Sondage ajouté ! Actualise la page du match pour le voir.");
      // Reset le formulaire
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
