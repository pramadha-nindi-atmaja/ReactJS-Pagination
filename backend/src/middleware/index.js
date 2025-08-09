import express from "express";
const appMiddleware = express();
import cors from "cors";
import router from "../routes/index.js";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { requestTimer } from "../controllers/personaldata.js";

// Security middleware
appMiddleware.use(helmet());

// Compress responses
appMiddleware.use(compression());

// Request logging
appMiddleware.use(morgan('combined'));

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    message: 'Too many requests, please try again later.'
  }
});

// Apply rate limiter to all requests
appMiddleware.use(limiter);

// Track request timing
appMiddleware.use(requestTimer);

appMiddleware.use(
  cors({
    origin: true,
    credentials: true,
    preflightContinue: false,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
);
appMiddleware.options("*", cors());
appMiddleware.use(express.json());
appMiddleware.use(express.urlencoded({ extended: true }));

// Health check endpoint
appMiddleware.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

appMiddleware.use(router);

// Error handling middleware
appMiddleware.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// 404 handler - must be last
appMiddleware.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Resource not found'
  });
});

export default appMiddleware;