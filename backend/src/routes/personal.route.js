import { Router } from "express";
import { 
  getPersonaldata, 
  getPersonalById, 
  exportPersonalData,
  requestTimer
} from "../controllers/personal.controller.js";
const personalRoute = Router();

// Middleware for tracking request timing
personalRoute.use(requestTimer);

// Get all personals with pagination and search
personalRoute.get("/personals", getPersonaldata);

// Get a single personal by ID
personalRoute.get("/personals/:id", getPersonalById);

// Export personal data
personalRoute.get("/personals-export", exportPersonalData);

// Route parameter validation middleware
personalRoute.param('id', (req, res, next, id) => {
  const parsedId = parseInt(id);
  
  if (isNaN(parsedId)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid ID parameter. Must be a number."
    });
  }
  
  req.parsedId = parsedId;
  next();
});

export default personalRoute;