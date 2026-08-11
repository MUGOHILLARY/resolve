import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

import { env } from "./config/env.js";
import requestLogger from "./middleware/requestLogger.js";

import healthRoutes from "./routes/healthRoutes.js";
import journalRoutes from "./routes/journalRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import blockerRoutes from "./routes/blockerRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";

const app = express();

/* -------------------------------------------------------------------------- */
/* Express Configuration                                                      */
/* -------------------------------------------------------------------------- */

app.set("trust proxy", 1);

/* -------------------------------------------------------------------------- */
/* CORS                                                                       */
/* -------------------------------------------------------------------------- */

const allowedOrigins = [
  env.FRONTEND_URL,

  // Resolve production
  "https://resolve-web-two.vercel.app",
  "https://resolve-web-git-main-mugohillarys-projects.vercel.app",

  // Local development
  "http://localhost:5173",
  "http://localhost:3000",

  // Additional origins supplied through environment variables
  ...(process.env.FRONTEND_URLS
    ? process.env.FRONTEND_URLS
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : []),
].filter(Boolean);

console.log("🌐 Allowed CORS origins:");
console.log(allowedOrigins);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    /*
     * Requests without an Origin header can come from:
     * - server-to-server requests
     * - health checks
     * - some extension/background requests
     */
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error("❌ CORS blocked origin:", origin);

    return callback(
      new Error(`CORS blocked origin: ${origin}`)
    );
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
};

/* -------------------------------------------------------------------------- */
/* Middleware                                                                 */
/* -------------------------------------------------------------------------- */

app.use(cors(corsOptions));

app.use(helmet());

app.use(compression());

app.use(express.json());

app.use(requestLogger);

/* -------------------------------------------------------------------------- */
/* Routes                                                                     */
/* -------------------------------------------------------------------------- */

/*
 * Health
 *
 * GET /
 */
app.use("/", healthRoutes);

/*
 * Journal
 *
 * GET    /api/journal
 * POST   /api/journal
 * DELETE /api/journal/:id
 */
app.use("/api/journal", journalRoutes);

/*
 * AI Chat
 *
 * POST   /api/chat
 * GET    /api/chat/history
 * DELETE /api/chat/history
 */
app.use("/api/chat", chatRoutes);

/*
 * Recovery Profile
 *
 * GET  /api/profile
 * POST /api/profile
 * PUT  /api/profile
 */
app.use("/api/profile", profileRoutes);

/*
 * Website Blocker
 *
 * GET /api/blocker
 *
 * This route is authenticated by blockerRoutes.ts.
 */
app.use("/api/blocker", blockerRoutes);

/*
 * Resolve Events
 *
 * POST /api/events
 */
app.use("/api/events", eventRoutes);

/*
 * Premium Subscription
 *
 * GET/POST/etc. /api/subscription
 */
app.use(
  "/api/subscription",
  subscriptionRoutes
);

/* -------------------------------------------------------------------------- */
/* 404 Handler                                                                */
/* -------------------------------------------------------------------------- */

app.use(
  (
    req: express.Request,
    res: express.Response
  ) => {
    res.status(404).json({
      success: false,
      message: "Route not found.",
    });
  }
);

/* -------------------------------------------------------------------------- */
/* Global Error Handler                                                       */
/* -------------------------------------------------------------------------- */

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("❌ API Error:", err);

    /*
     * CORS errors
     */
    if (
      err.message?.startsWith(
        "CORS blocked origin"
      )
    ) {
      return res.status(403).json({
        success: false,
        message: err.message,
      });
    }

    /*
     * General API error
     */
    return res.status(err.status || 500).json({
      success: false,
      message:
        err.message ||
        "Internal server error.",
    });
  }
);

/* -------------------------------------------------------------------------- */
/* Start Server                                                               */
/* -------------------------------------------------------------------------- */

const server = app.listen(
  env.PORT,
  () => {
    console.log(
      "========================================"
    );

    console.log(
      "🛡️  Resolve API Started Successfully"
    );

    console.log(
      "========================================"
    );

    console.log(
      `🌍 Environment : ${env.NODE_ENV}`
    );

    console.log(
      `📡 Port        : ${env.PORT}`
    );

    console.log(
      `🌐 Frontend    : ${env.FRONTEND_URL}`
    );

    console.log(
      `❤️ Health      : http://localhost:${env.PORT}/`
    );

    console.log(
      "🛡️ Blocker     : /api/blocker"
    );

    console.log(
      "💎 Premium     : /api/subscription"
    );

    console.log(
      "========================================"
    );
  }
);

/* -------------------------------------------------------------------------- */
/* Graceful Shutdown                                                          */
/* -------------------------------------------------------------------------- */

function shutdown(signal: string) {
  console.log(`\n⚠️ Received ${signal}`);

  console.log(
    "Closing Resolve API..."
  );

  server.close(() => {
    console.log(
      "✅ HTTP server closed."
    );

    process.exit(0);
  });
}

process.on("SIGINT", () =>
  shutdown("SIGINT")
);

process.on("SIGTERM", () =>
  shutdown("SIGTERM")
);