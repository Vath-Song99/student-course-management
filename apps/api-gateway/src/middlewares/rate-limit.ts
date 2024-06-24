import { rateLimit } from "express-rate-limit";
import express from "express";
import getConfig from "@api-gateway/utils/createConfig";

const limiterOptions = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
  max: getConfig().env === 'development'? 500 : 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});

export const applyRateLimit = (app: express.Application) => {
  app.use(limiterOptions);
};
