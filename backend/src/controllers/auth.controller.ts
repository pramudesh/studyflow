import { Request, Response } from "express";
import { supabaseAnon, supabaseForUser } from "../config/supabase";
import { localDb } from "../config/localDb";
import { isLocalDb } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

/**
 * POST /api/auth/signup
 */
export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, fullName } = req.body;

  if (isLocalDb) {
    const result = localDb.createUser({ email, password, fullName });
    res.status(201).json(result);
    return;
  }

  const { data, error } = await supabaseAnon.auth.signUp({
    email,
    password,
    options: {
      data: fullName ? { full_name: fullName } : undefined,
    },
  });

  if (error) {
    throw ApiError.badRequest(error.message);
  }

  res.status(201).json({
    user: data.user,
    session: data.session,
    requiresEmailConfirmation: !data.session,
  });
});

/** POST /api/auth/login */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (isLocalDb) {
    const result = localDb.loginUser({ email, password });
    res.json(result);
    return;
  }

  const { data, error } = await supabaseAnon.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw ApiError.unauthorized(error.message);
  }

  res.json({ user: data.user, session: data.session });
});

/** POST /api/auth/refresh */
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (isLocalDb) {
    const result = localDb.refreshSession(refreshToken);
    res.json(result);
    return;
  }

  const { data, error } = await supabaseAnon.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error) {
    throw ApiError.unauthorized(error.message);
  }

  res.json({ user: data.user, session: data.session });
});

/** POST /api/auth/logout */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (isLocalDb) {
    if (req.accessToken) {
      localDb.deleteSession(req.accessToken);
    }
    res.status(204).send();
    return;
  }

  if (req.supabase) {
    await req.supabase.auth.signOut();
  }
  res.status(204).send();
});

/** POST /api/auth/forgot-password */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email, redirectTo } = req.body;

  if (isLocalDb) {
    res.json({ message: "If that email exists, a reset link has been sent." });
    return;
  }

  const { error } = await supabaseAnon.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    throw ApiError.badRequest(error.message);
  }

  res.json({ message: "If that email exists, a reset link has been sent." });
});

/** POST /api/auth/reset-password */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { password, accessToken } = req.body;
  const token =
    accessToken ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null);

  if (!token) {
    throw ApiError.unauthorized("Missing access token for password reset");
  }

  if (isLocalDb) {
    const user = localDb.getUserFromToken(token);
    if (!user) {
      throw ApiError.unauthorized("Invalid or expired reset token");
    }
    localDb.updateUserPassword(user.id, password);
    res.json({ message: "Password updated successfully" });
    return;
  }

  const client = supabaseForUser(token);
  const { error } = await client.auth.updateUser({ password });

  if (error) {
    throw ApiError.badRequest(error.message);
  }

  res.json({ message: "Password updated successfully" });
});

/** GET /api/auth/me */
export const me = asyncHandler(async (req: Request, res: Response) => {
  res.json({ user: req.user });
});

/** GET /api/auth/oauth/google */
export const googleOAuth = asyncHandler(async (req: Request, res: Response) => {
  const redirectTo =
    (req.query.redirectTo as string) || "http://localhost:5173/auth/callback";

  if (isLocalDb) {
    throw ApiError.badRequest(
      "Real Google Login requires your live Supabase key. Please paste the key from your Supabase screen into backend/.env, or use your own Email & Password below to sign up."
    );
  }

  const { data, error } = await supabaseAnon.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  });

  if (error) {
    throw ApiError.badRequest(error.message);
  }

  res.json({ url: data.url });
});


