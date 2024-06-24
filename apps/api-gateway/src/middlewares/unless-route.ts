// import { publicKey } from "@api-gateway/server";
import { NextFunction, Request, Response } from "express";
// import { verify } from "jsonwebtoken";

// Middleware to conditionally apply another middleware unless the route matches a specific path
export default function unless(path: string, middleware: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith(path)) {
      return next();
    } else if (req.path.endsWith("teachers")) {
      return next();
    }
    middleware(req, res, next);
  };
}
