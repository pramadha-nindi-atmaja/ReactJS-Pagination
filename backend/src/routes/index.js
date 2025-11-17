import { Router } from "express";
import personalRoute from "./personal.route.js";

const router = Router();

/**
 * API ROOT ROUTES
 */
router.use("/api/personal", personalRoute);

export default router;
