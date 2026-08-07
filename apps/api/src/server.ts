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

const app = express();

/*
|--------------------------------------------------------------------------
| Express Configuration
|--------------------------------------------------------------------------
*/

app.set("trust proxy", 1);

/*
|--------------------------------------------------------------------------
| CORS Configuration
|--------------------------------------------------------------------------
|
| Resolve may be accessed from more than one Vercel deployment URL.
|
*/

const allowedOrigins = [
  "https://resolve-web-two.vercel.app",
  "https://resolve-web-git-main-mugohillarys-projects.vercel.app",
];

/*
|--------------------------------------------------------------------------
| Add FRONTEND_URL from environment if it exists
|--------------------------------------------------------------------------
|
| This allows Render to control the production frontend URL.
|
*/

if (env.FRONTEND_URL) {
  env.FRONTEND_URL
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean)
    .forEach((url) => {
      if (!allowedOrigins.includes(url)) {
        allowedOrigins.push(url);
      }
    });
}

/*
|--------------------------------------------------------------------------
| CORS Middleware
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // such as health checks/server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn("❌ CORS blocked origin:", origin);

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

    optionsSuccessStatus: 204,
  })
);

/*
|--------------------------------------------------------------------------
| Security / Compression
|--------------------------------------------------------------------------
*/

app.use(helmet());

app.use(compression());

app.use(express.json());

app.use(requestLogger);

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

// Health Check
app.use("/", healthRoutes);

// Journal API
app.use("/api/journal", journalRoutes);

// AI Chat API
app.use("/api/chat", chatRoutes);

// Recovery Profile API
app.use("/api/profile", profileRoutes);

// Website Blocker API
app.use("/api/blocker", blockerRoutes);

// Resolve Events API
app.use("/api/events", eventRoutes);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("❌", err);

    // Handle CORS errors
    if (err.message?.startsWith("CORS blocked origin")) {
      return res.status(403).json({
        success: false,
        message: err.message,
      });
    }

    res.status(err.status || 500).json({
      success: false,
      message:
        err.message || "Internal server error.",
    });
  }
);

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

const server = app.listen(env.PORT, () => {
  console.log("========================================");
  console.log("🛡️  Resolve API Started Successfully");
  console.log("========================================");
  console.log(`🌍 Environment : ${env.NODE_ENV}`);
  console.log(`📡 Port        : ${env.PORT}`);
  console.log(`🌐 Frontend    : ${allowedOrigins.join(", ")}`);
  console.log(
    `❤️ Health      : http://localhost:${env.PORT}/`
  );
  console.log("========================================");
});

/*
|--------------------------------------------------------------------------
| Graceful Shutdown
|--------------------------------------------------------------------------
*/

function shutdown(signal: string) {
  console.log(`\n⚠️ Received ${signal}`);
  console.log("Closing Resolve API...");

  server.close(() => {
    console.log("✅ HTTP server closed.");
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));

process.on("SIGTERM", () => shutdown("SIGTERM"));