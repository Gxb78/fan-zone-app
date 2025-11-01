// src/setupTests.js
import "@testing-library/jest-dom";

// Mock pour Firebase avec le chemin corrigé
jest.mock("./services/firebase", () => ({
  // On exporte aussi les fonctions nommées pour la cohérence
  __esModule: true,
  ...jest.requireActual("./services/firebase"), // Garde les autres exports réels si besoin
  signInUser: jest.fn((callback) => callback({ uid: "test-uid" })),
  initializeUserStats: jest.fn(() => Promise.resolve()),
  getCurrentUser: jest.fn(() => ({ uid: "test-uid" })),
  getLeaderboard: jest.fn(() => Promise.resolve([])),
  // Assurez-vous que le mock de la base de données est suffisant pour le rendu initial
  db: {},
}));

// Mock pour les APIs externes (déjà bon)
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ events: [] }),
  })
);

// Mock pour window.matchMedia (déjà bon)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
