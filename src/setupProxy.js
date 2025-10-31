const { createProxyMiddleware } = require("http-proxy-middleware");

const API_SPORTS_KEY = "a3dec19b4cdc88a684e741f980a14766";

module.exports = function (app) {
  app.use(
    // 👇 ON NE SURVEILLE PLUS TOUT, SEULEMENT CE QUI COMMENCE PAR /api
    "/api",
    createProxyMiddleware({
      target: "https://v1.basketball.api-sports.io",
      changeOrigin: true,
      // On lui dit d'enlever le '/api' avant d'envoyer la requête
      pathRewrite: {
        "^/api": "",
      },
      onProxyReq: (proxyReq) => {
        proxyReq.setHeader("x-rapidapi-key", API_SPORTS_KEY);
        proxyReq.setHeader("x-rapidapi-host", "v1.basketball.api-sports.io");
      },
    })
  );
};
