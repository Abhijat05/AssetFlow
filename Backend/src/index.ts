import "./types/index.js"; // load Express.Locals augmentation
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { toNodeHandler } from "better-auth/node";
import { env } from "./config/env.js";
import { auth } from "./auth/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import apiRoutes from "./routes/index.js";

const app = express();

// Security & logging
app.use(helmet());
app.use(
  cors({
    origin: env.BETTER_AUTH_URL,
    credentials: true,
  })
);
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

// Better Auth handles all /api/auth/* routes (sign-up, login, logout, sessions, password reset)
// Express 5 requires a named splat — bare * is not valid in path-to-regexp v8+
app.all("/api/auth/{*splat}", toNodeHandler(auth));

// Body parsing (applied AFTER Better Auth so BA can read raw body if needed)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Application routes
app.use("/api/v1", apiRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Global error handler (must be last)
app.use(errorHandler);

app.listen(Number(env.PORT), () => {
  console.log(`AssetFlow API running on port ${env.PORT} [${env.NODE_ENV}]`);
});
