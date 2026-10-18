import { NextFunction, Request, Response } from "express";
import { supabaseForUser } from "../config/supabase";
import { localDb } from "../config/localDb";
import { isLocalDb } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

/**
 * Requires a valid access token in the Authorization header:
 *   Authorization: Bearer <access_token>
 *
 * On success, attaches:
 *   req.user        — the authenticated user
 *   req.accessToken — the raw token
 *   req.supabase    — a Supabase client scoped to this user (if Supabase mode)
 */
export const requireAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      throw ApiError.unauthorized("Missing bearer access token");
    }

    if (isLocalDb) {
      const user = localDb.getUserFromToken(token);
      if (!user) {
        throw ApiError.unauthorized("Invalid or expired session");
      }
      req.user = user as unknown as Express.Request["user"];
      req.accessToken = token;
      return next();
    }

    const client = supabaseForUser(token);
    const { data, error } = await client.auth.getUser(token);

    if (error || !data.user) {
      throw ApiError.unauthorized("Invalid or expired session");
    }

    req.user = data.user;
    req.accessToken = token;
    req.supabase = client;
    next();
  }
);
