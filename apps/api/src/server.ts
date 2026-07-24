import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import healthRoutes from "./routes/healthRoutes.js";
import journalRoutes from "./routes/journalRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";

dotenv.config();

const app = express();

/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

app.use(cors());

app.use(express.json());

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

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
  console.log(
    `🚀 Resolve API running on http://localhost:${PORT}`
  );
});