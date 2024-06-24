import { CookieOptions } from "express";
import getConfig from "./createConfig";

const currentEnv = process.env.NODE_ENV || "development";
const config = getConfig(currentEnv);
export const options: CookieOptions = {
  httpOnly: true, // Cookie cannot be accessed via JavaScript
  secure: process.env.NODE_ENV !== "development", // Use secure cookies in production
  maxAge: 30.44 * 24 * 60 * 60 * 1000, // Cookie expiration time in milliseconds (1 month)
  ...(config.env !== "development" && {
    sameSite: "strict",
  }), // Helps prevent CSRF attacks
};
