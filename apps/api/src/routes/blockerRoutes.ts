import { Router } from "express";

import { requireAuth } from "../middleware/requireAuth.js";
import { requirePremium } from "../middleware/requirePremium.js";

import {
  getBlockerSettings,
  updateBlockerSettings,
  addCustomWebsite,
  removeCustomWebsite,
} from "../controllers/blockerController.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
|
| Every blocker endpoint requires an authenticated user.
|
|--------------------------------------------------------------------------
*/

router.use(requireAuth);

/*
|--------------------------------------------------------------------------
| Basic Blocker Settings
|--------------------------------------------------------------------------
|
| Available to Free and Premium users.
|
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  getBlockerSettings
);

router.patch(
  "/",
  updateBlockerSettings
);

/*
|--------------------------------------------------------------------------
| Premium Custom Website Blocking
|--------------------------------------------------------------------------
|
| These endpoints require an active Premium subscription.
|
|--------------------------------------------------------------------------
*/

router.post(
  "/custom-site",
  requirePremium,
  addCustomWebsite
);

router.delete(
  "/custom-site",
  requirePremium,
  removeCustomWebsite
);

export default router;