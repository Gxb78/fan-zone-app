// src/setupProxy.js
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    // ✅ Tout ce qui commence par '/api-football' sera intercepté
    "/api-football",
    createProxyMiddleware({
      // L'adresse de la "boîte de nuit" (l'API)
      target: "https://www.thesportsdb.com",
      changeOrigin: true,
      // On réécrit l'URL pour qu'elle soit correcte pour le serveur distant
      pathRewrite: {
        "^/api-football": "/api/v1/json", // Remplace '/api-football' par le vrai chemin de l'API
      },
    })
  );
};
