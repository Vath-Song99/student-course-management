import express, { Application, NextFunction, Request, Response } from "express";
import getConfig from "./utils/createConfig";
import compression from "compression";
import cookieSession from "cookie-session";
import hpp from "hpp";
import helmet from "helmet";
import cors from "cors";
import { applyRateLimit } from "./middlewares/rate-limit";
import applyProxy from "./middlewares/proxy";
import { errorHandler } from "./middlewares/error-handler";
import { StatusCode } from "./utils/consts";
import { logger } from "./utils/logger";
import unless from "./middlewares/unless-route";
import { verifyUser } from "./middlewares/auth-middleware";
import cookieParser from "cookie-parser";
import { OptionSession } from "./utils/cookieOption";

const app: Application = express();

const currentEnv = process.env.NODE_ENV || "development";
const config = getConfig(currentEnv);

// ===================
// Security Middleware
// ===================
app.set("trust proxy", 1);
app.use(compression());
app.use(cookieParser());
app.use(cookieSession(OptionSession));

// Prevent HTTP Parameter Pollution attacks
app.use(hpp());
// Prevent Some Security:
// - Stops browsers from sharing your site's vistor data
// - Stops your website from being displayed in a frame
// - Prevent XSS, etc.
app.use(helmet());

// Only Allow Specific Origin to Access API Gateway (Frontend)
// Mock getConfig function. Replace with your actual config logic.
//config.env === "development" ? "*"
console.log(config.clientUrl)
const corsOptions = {
  origin : config.clientUrl || "http://localhost:8000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Apply Limit Request
applyRateLimit(app);

// Hide Express Server Information
app.disable("x-powered-by");

// ===================
// JWT Middleware
// ===================
app.use(unless("/v1/auth", verifyUser));

// ===================
// Proxy Routes
// ===================
applyProxy(app);

// ====================
// Global Error Handler
// ====================
app.use("*", (req: Request, res: Response, _next: NextFunction) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  logger.error(`${fullUrl} endpoint does not exist`);
  res
    .status(StatusCode.NotFound)
    .json({ message: "The endpoint called does not exist." });
});

// Erorr handlers
app.use(errorHandler);

export default app;
