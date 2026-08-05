import { Router } from "express";
import { env } from "../config/env.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

router.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    service: "Resolve API",
    status: "healthy",
    environment: env.NODE_ENV,
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

/*
|--------------------------------------------------------------------------
| Ready Check
|--------------------------------------------------------------------------
*/

router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    status: "ready",
  });
});

export default router;