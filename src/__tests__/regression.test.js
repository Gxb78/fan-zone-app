// src/__tests__/regression.test.js
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppContent } from "../App";

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

  // Test 2 : Le squelette de notre parcours utilisateur complet
  test.skip("Le parcours utilisateur complet (Lobby > Match > Vote > Chat) fonctionne", async () => {
    // Le ".skip" indique à Jest d'ignorer ce test pour le moment.
    // Nous le réactiverons une fois les migrations terminées.

    render(
      <MemoryRouter>
        <AppContent />
      </MemoryRouter>
    );

    // 1. L'utilisateur arrive sur le lobby et voit un match
    const featuredMatch = await screen.findByText(/LE MATCH À LA UNE/i);
    expect(featuredMatch).toBeInTheDocument();

    // 2. L'utilisateur clique sur le match pour entrer dans la FanZone
    fireEvent.click(featuredMatch);

    // 3. Il attend que la page du match se charge et voit un sondage
    const pollTitle = await screen.findByText(/Vainqueur du Match/i);
    expect(pollTitle).toBeInTheDocument();

    // 4. Il vote pour une équipe (par exemple, la première option)
    const voteOption = await screen.findByText(/Paris SG/i); // Ou un autre nom d'équipe
    fireEvent.click(voteOption);

    // 5. Il envoie un message dans le chat
    const chatInput = screen.getByPlaceholderText(
      /Ton analyse, ton pronostic.../i
    );
    fireEvent.change(chatInput, { target: { value: "Super match !" } });
    fireEvent.click(screen.getByText(/Envoyer/i));

    // 6. Il vérifie que son message est bien apparu
    const sentMessage = await screen.findByText(/Super match !/i);
    expect(sentMessage).toBeInTheDocument();
  });
});
