import { Router } from "express";

import {
  getProfile,
  createProfile,
  updateProfile,
} from "../controllers/profileController.js";

import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Recovery Profile
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  requireAuth,
  getProfile
);

router.post(
  "/",
  requireAuth,
  createProfile
);

router.put(
  "/",
  requireAuth,
  updateProfile
);

export default router;