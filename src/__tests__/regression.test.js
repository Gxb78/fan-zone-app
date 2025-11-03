// src/__tests__/regression.test.js
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppContent } from "../app/App"; // 👈 On importe depuis le nouveau chemin

// On importe les fonctions mockées de Firebase pour les espionner
import { signInUser, initializeUserStats } from "../services/firebase";

/**
 * 🚨 TEST DE NON-RÉGRESSION (End-to-End) 🚨
 * Ce test simule le "happy path" - le parcours utilisateur le plus critique.
 * Il garantit que les fonctionnalités principales fonctionnent ensemble.
 */
describe("🚨 Regression E2E Test - Happy Path", () => {
  // Test 1 : Le smoke test, on le garde, il est précieux.
  test("L'application se charge sans planter et affiche le lobby", async () => {
    render(
      <MemoryRouter>
        <AppContent />
      </MemoryRouter>
    );
    // On attend que le titre du match à la une s'affiche
    const titleElement = await screen.findByText(/LE MATCH À LA UNE/i);
    expect(titleElement).toBeInTheDocument();
  });

  // 👇 Test 2 : On retire le ".skip" et on implémente la logique !
  test("Le parcours utilisateur complet (Lobby > Match > Vote > Chat) fonctionne", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppContent />
      </MemoryRouter>
    );

    // 1. L'utilisateur arrive sur le lobby et voit un match
    // Utiliser findBy est crucial car les données sont chargées de manière asynchrone
    const featuredMatch = await screen.findByText(/LE MATCH À LA UNE/i);
    expect(featuredMatch).toBeInTheDocument();

    // 2. L'utilisateur clique sur le match pour entrer dans la FanZone
    // Nous cliquons sur le conteneur parent car le texte lui-même n'est peut-être pas un élément cliquable
    fireEvent.click(featuredMatch.closest(".featured-match-container"));

    // 3. Il attend que la page du match se charge et voit le sondage principal
    const pollTitle = await screen.findByText(/Résultat du Classique/i);
    expect(pollTitle).toBeInTheDocument();

    // 4. Il vote pour une équipe (par exemple, la première option)
    const voteOption = await screen.findByText(/Paris SG/i);
    fireEvent.click(voteOption);

    // 5. Il envoie un message dans le chat
    const chatInput = screen.getByPlaceholderText(
      /Ton analyse, ton pronostic.../i
    );
    fireEvent.change(chatInput, { target: { value: "Super match !" } });
    fireEvent.click(screen.getByText(/Envoyer/i));

    // 6. Il vérifie que son message est bien apparu
    // waitFor est utile ici pour attendre que l'UI se mette à jour après l'envoi
    await waitFor(() => {
      const sentMessage = screen.getByText(/Super match !/i);
      expect(sentMessage).toBeInTheDocument();
    });
  });
});
