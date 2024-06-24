import { NextFunction, Request, Response } from "express";
import { Schema, ZodError } from "zod";

export const zodValidate = (schema: Schema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((issue) => {
          return `${issue.path.join(".")} is ${issue.message}`;
        });
        return res.status(422).json({ errors: errorMessages });
      }
      console.error("Something went wrong:", error);
      return res.status(500).json({ error: "Something went wrong!" });
    }
  };
};
