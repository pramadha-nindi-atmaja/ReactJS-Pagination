import { Router } from "express";
import {
  getPersonaldata,
  getPersonalById,
  exportPersonalData,
  requestTimer,
} from "../controllers/personal.controller.js";

const personalRoute = Router();

/**
 * Middleware: Track request timing
 */
personalRoute.use(requestTimer);

/**
 * Validate route param :id
 */
personalRoute.param("id", (req, res, next, id) => {
  const parsedId = Number(id);

  if (Number.isNaN(parsedId)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid ID parameter. Must be a valid number.",
    });
  }

  req.parsedId = parsedId;
  next();
});

/**
 * Routes
 */
personalRoute.get("/", getPersonaldata);
personalRoute.get("/:id", getPersonalById);
personalRoute.get("/export/list", exportPersonalData);

export default personalRoute;
