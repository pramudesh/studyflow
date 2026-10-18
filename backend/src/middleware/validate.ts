import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";
import { ApiError } from "../utils/ApiError";

type RequestPart = "body" | "params" | "query";

export function validate(schema: AnyZodObject, part: RequestPart = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req[part] = schema.parse(req[part]);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const firstMessage =
          err.issues[0]?.message || "Validation failed";
        next(ApiError.badRequest(firstMessage, err.flatten()));
        return;
      }
      next(err);
    }
  };
}
