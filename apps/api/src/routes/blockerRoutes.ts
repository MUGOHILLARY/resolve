import { Router } from "express";

import { requireAuth } from "../middleware/requireAuth.js";
import { getBlockerSettings } from "../controllers/blockerController.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

router.use(requireAuth);

/*
|--------------------------------------------------------------------------
| Blocker Settings
|--------------------------------------------------------------------------
*/

router.get("/", getBlockerSettings);

export default router;