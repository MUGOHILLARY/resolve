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
/* Express Configuration                                                       */
/* -------------------------------------------------------------------------- */

app.set("trust proxy", 1);

/* -------------------------------------------------------------------------- */
/* CORS                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * IMPORTANT:
 *
 * The web application uses Vercel origins.
 * The browser extension uses an `extensions://` origin.
 *
 * Browser-extension requests generally do not need the same
 * credentialed CORS flow as the web application, so we allow
 * the known web origins explicitly and allow extension requests
 * without reflecting arbitrary origins.
 */

const allowedWebOrigins = [
  // Environment-configured frontend
  env.FRONTEND_URL,

  // Production Vercel applications
  "https://resolve-web-two.vercel.app",
  "https://resolve-web-git-main-mugohillarys-projects.vercel.app",

  // Local development
  "http://localhost:5173",
  "http://localhost:3000",

  // Additional origins from Render environment variable
  ...(process.env.FRONTEND_URLS
    ? process.env.FRONTEND_URLS
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : []),
].filter(Boolean);

console.log("🌐 Allowed web CORS origins:");
console.log(allowedWebOrigins);

/**
 * Determine whether an origin belongs to the Resolve extension.
 */
function isExtensionOrigin(origin: string): boolean {
  return (
    origin.startsWith("chrome-extension://") ||
    origin.startsWith("moz-extension://") ||
    origin.startsWith("ms-browser-extension://") ||
    origin.startsWith("extension://")
  );
}

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    /*
     * No Origin header:
     *
     * This can happen with:
     * - Render health checks
     * - curl
     * - server-to-server requests
     * - some extension requests
     */
    if (!origin) {
      return callback(null, true);
    }

    /*
     * Normal Resolve web application.
     */
    if (allowedWebOrigins.includes(origin)) {
      return callback(null, true);
    }

    /*
     * Browser extension.
     *
     * Allow extension origins so the extension can communicate
     * with the Resolve API.
     */
    if (isExtensionOrigin(origin)) {
      console.log(
        "🧩 Allowing Resolve extension origin:",
        origin
      );

      return callback(null, true);
    }

    /*
     * Unknown origin.
     */
    console.error(
      "❌ CORS blocked origin:",
      origin
    );

    return callback(
      new Error(`CORS blocked origin: ${origin}`)
    );
  },

  /*
   * The web frontend uses Authorization headers and Supabase
   * authentication. Keep credentials enabled for the web app.
   */
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
    "Accept",
    "Origin",
    "X-Requested-With",
  ],

  optionsSuccessStatus: 204,
};

/*
 * IMPORTANT:
 *
 * Register CORS before routes.
 */
app.use(cors(corsOptions));

/*
 * Explicitly answer browser preflight requests.
 */
app.options("*", cors(corsOptions));

/* -------------------------------------------------------------------------- */
/* Security / Compression / JSON                                              */
/* -------------------------------------------------------------------------- */

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(compression());

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(requestLogger);

/* -------------------------------------------------------------------------- */
/* Routes                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Health
 *
 * GET /
 */
app.use("/", healthRoutes);

/**
 * Journal
 *
 * GET    /api/journal
 * POST   /api/journal
 * DELETE /api/journal/:id
 */
app.use(
  "/api/journal",
  journalRoutes
);

/**
 * AI Chat
 *
 * POST   /api/chat
 * GET    /api/chat/history
 * DELETE /api/chat/history
 */
app.use(
  "/api/chat",
  chatRoutes
);

/**
 * Recovery Profile
 *
 * GET  /api/profile
 * POST /api/profile
 * PUT  /api/profile
 */
app.use(
  "/api/profile",
  profileRoutes
);

/**
 * Website Blocker
 *
 * GET /api/blocker
 *
 * This route should authenticate the Resolve
 * browser extension/user.
 */
app.use(
  "/api/blocker",
  blockerRoutes
);

/**
 * Resolve Events
 *
 * POST /api/events
 */
app.use(
  "/api/events",
  eventRoutes
);

/**
 * Premium Subscription
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
    console.error(
      "❌ API Error:",
      err
    );

    /*
     * CORS error.
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
     * General API error.
     */
    return res.status(
      err.status || 500
    ).json({
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
      "📓 Journal     : /api/journal"
    );

    console.log(
      "👤 Profile     : /api/profile"
    );

    console.log(
      "🤖 Chat        : /api/chat"
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

function shutdown(
  signal: string
) {
  console.log(
    `\n⚠️ Received ${signal}`
  );

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

process.on(
  "SIGINT",
  () => shutdown("SIGINT")
);

process.on(
  "SIGTERM",
  () => shutdown("SIGTERM")
);