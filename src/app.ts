import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { parseEnv } from "./config/env";
import healthRouter from "./routes/health.route";
import { createBookRouter } from "./routes/book.route";
import { notFound } from "./middleware/not-found";
import { errorHandler } from "./middleware/error-handler";
import { requestLogger } from "./middleware/request-logger";

export function createApp() {
  const config = parseEnv(process.env);
  const app = express();

  // Security headers
  app.use(helmet());

  // Rate limiting — thresholds from validated env config
  app.use(
    rateLimit({
      windowMs: config.RATE_LIMIT_WINDOW_MS,
      max: config.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  // Body parsing
  app.use(express.json({ limit: "10kb" }));

  // Request logging
  app.use(requestLogger);

  // Routes
  app.use("/health", healthRouter);
  app.use("/api/v1/books", createBookRouter());

  // 404 and error handlers — must be last
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

export const app = createApp();
