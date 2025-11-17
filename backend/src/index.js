import express from "express";
import "dotenv/config";
import appMiddleware from "./middleware/index.js";

const app = express();
const PORT = process.env.PORT ?? 3000;

/**
 * Load global middleware (security, cors, compression, routes, error handlers)
 */
app.use(appMiddleware);

/**
 * Start HTTP server
 */
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
