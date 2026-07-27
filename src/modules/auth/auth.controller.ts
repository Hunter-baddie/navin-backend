import type { RequestHandler } from 'express';
import {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  refreshToken,
} from './auth.service.js';
import { sendResponse } from '../../shared/http/sendResponse.js';

/**
 * Registers a new user account and returns a JWT.
 *
 * @param req.body.email - User email address.
 * @param req.body.name - Display name.
 * @param req.body.password - Plaintext password (min length enforced by validation).
 * @param req.body.organizationId - Optional organization to attach the user to.
 * @returns HTTP 201 with envelope `{ success, message, data }` where data is `{ user, token }`.
 * @throws {AppError} 409 EMAIL_TAKEN — when the email is already registered.
 */
export const signupController: RequestHandler = async (req, res) => {
  const result = await signup(req.body);
  sendResponse(res, 201, true, 'Account created successfully', result);
};

/**
 * Authenticates credentials and returns a JWT.
 *
 * @param req.body.email - User email address.
 * @param req.body.password - Plaintext password.
 * @returns HTTP 200 with envelope `{ success, message, data }` where data is `{ user, token }`.
 * @throws {AppError} 401 INVALID_CREDENTIALS — when email or password is incorrect.
 */
export const loginController: RequestHandler = async (req, res) => {
  const result = await login(req.body);
  sendResponse(res, 200, true, 'Login successful', result);
};

/**
 * Revokes the current JWT by adding its jti to the Redis blocklist.
 * Requires authentication (`requireAuth`).
 *
 * @returns HTTP 200 with envelope `{ success, message, data: null }`.
 * @throws {AppError} 401 ERR_AUTH_INVALID — when the Authorization header/token is missing or invalid.
 * @throws {AppError} 401 TOKEN_REVOKED — when the token was already revoked.
 */
export const logoutController: RequestHandler = async (req, res) => {
  const token = req.headers.authorization!.substring(7);
  await logout(token);
  sendResponse(res, 200, true, 'Logged out successfully', null);
};

/**
 * Starts the password-reset flow. Always succeeds to prevent email enumeration.
 *
 * @param req.body.email - Email address that may receive a reset link.
 * @returns HTTP 200 with envelope `{ success, message, data: null }`.
 */
export const forgotPasswordController: RequestHandler = async (req, res) => {
  await forgotPassword(req.body.email as string);
  sendResponse(res, 200, true, 'If the email exists, a reset link has been sent', null);
};

/**
 * Completes password reset using a one-time reset token from email.
 *
 * @param req.body.token - Password-reset JWT from the email link.
 * @param req.body.newPassword - New plaintext password.
 * @returns HTTP 200 with envelope `{ success, message, data: null }`.
 * @throws {AppError} 400 ERR_AUTH_INVALID_RESET_TOKEN — when the token is invalid, expired, wrong type, or user missing.
 */
export const resetPasswordController: RequestHandler = async (req, res) => {
  await resetPassword(req.body.token as string, req.body.newPassword as string);
  sendResponse(res, 200, true, 'Password reset successfully', null);
};

/**
 * Issues a new JWT from a presented session token within the refresh grace window.
 *
 * @param req.body.token - Existing JWT to refresh (may be expired within grace period).
 * @returns HTTP 200 with envelope `{ success, message, data }` where data is `{ token, expiresIn }`.
 * @throws {AppError} 401 INVALID_TOKEN — when the token cannot be verified or lacks a jti.
 * @throws {AppError} 401 TOKEN_REVOKED — when the token was revoked.
 * @throws {AppError} 401 TOKEN_EXPIRED — when the token is too old to refresh.
 * @throws {AppError} 401 USER_NOT_FOUND — when the user no longer exists.
 */
export const refreshController: RequestHandler = async (req, res) => {
  const { token } = req.body as { token: string };
  const result = await refreshToken(token);
  sendResponse(res, 200, true, 'Token refreshed', result);
};
