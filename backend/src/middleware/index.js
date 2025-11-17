import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

import router from "../routes/index.js";
import { requestTimer } from "../controllers/personaldata.js";

const appMiddleware = express();

/** ----------------------------------
 *  GLOBAL SECURITY & PERFORMANCE MIDDLEWARE
 * ---------------------------------- */

// Basic security headers
appMiddleware.use(helmet());

// Gzip compression
appMiddleware.use(compression());

// Request logging
appMiddleware.use(morgan("combined"));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Too many requests, please try again later.",
  },
});

appMiddleware.use(limiter);

/** ----------------------------------
 *  REQUEST UTILITIES
 * ---------------------------------- */

// Track request processing time
appMiddleware.use(requestTimer);

// JSON & form data parsing
appMiddleware.use(express.json());
appMiddleware.use(express.urlencoded({ extended: true }));

// CORS
appMiddleware.use(
  cors({
    origin: true,
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
);

appMiddleware.options("*", cors());

/** ----------------------------------
 *  SYSTEM ENDPOINTS
 * ---------------------------------- */

appMiddleware.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/** ----------------------------------
 *  MAIN ROUTES
 * ---------------------------------- */

appMiddleware.use(router);

/** ----------------------------------
 *  ERROR HANDLING
 * ---------------------------------- */

// Global error handler
appMiddleware.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "production" ? {} : err,
  });
});

// 404 Not Found
appMiddleware.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Resource not found",
  });
});

export default appMiddleware;
