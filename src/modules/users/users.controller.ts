import type { RequestHandler } from 'express';
import * as usersService from './users.service.js';
import { sendResponse } from '../../shared/http/sendResponse.js';

/**
 * Registers a password-less user under the caller's organization.
 * Requires auth and ADMIN / SUPER_ADMIN.
 *
 * @param req.body.email - Invitee email.
 * @param req.body.name - Display name.
 * @param req.body.role - Role to assign (defaults to VIEWER via validation).
 * @returns HTTP 201 with envelope `{ success, message, data }` containing the created user.
 * @throws {AppError} 401 ERR_AUTH_INVALID — when JWT auth fails.
 * @throws {AppError} 403 ERR_PERMISSION_DENIED — when the caller lacks ADMIN / SUPER_ADMIN.
 * @throws {AppError} 400 INVALID_ROLE — when attempting to create SUPER_ADMIN via this endpoint.
 * @throws {AppError} 409 EMAIL_TAKEN — when the email is already registered.
 */
export const createUserController: RequestHandler = async (req, res) => {
  const user = await usersService.registerUser({
    email: req.body.email,
    name: req.body.name,
    role: req.body.role,
    organizationId: req.user?.organizationId,
  });
  sendResponse(res, 201, true, 'User registered successfully', user);
};

/**
 * Creates a team member in the caller's organization.
 * Requires auth and ADMIN / SUPER_ADMIN.
 *
 * @param req.body.email - Team member email.
 * @param req.body.name - Display name.
 * @param req.body.role - Role to assign.
 * @returns HTTP 201 with envelope `{ success, message, data }` containing the created user.
 * @throws {AppError} 401 ERR_AUTH_INVALID — when JWT auth fails.
 * @throws {AppError} 403 ERR_PERMISSION_DENIED — when the caller lacks ADMIN / SUPER_ADMIN.
 * @throws {AppError} 409 EMAIL_TAKEN — when the email is already registered.
 */
export const createTeamMemberController: RequestHandler = async (req, res) => {
  const user = await usersService.createTeamMember({
    email: req.body.email,
    name: req.body.name,
    role: req.body.role,
    callerOrganizationId: req.user?.organizationId ?? '',
  });
  sendResponse(res, 201, true, 'Team member created successfully', user);
};

/**
 * Soft-deletes a user by id. Requires auth and ADMIN / SUPER_ADMIN.
 *
 * @param req.params.id - User id to delete.
 * @returns HTTP 200 with envelope `{ success, message, data }` containing the deleted user.
 * @throws {AppError} 401 ERR_AUTH_INVALID — when JWT auth fails.
 * @throws {AppError} 403 ERR_PERMISSION_DENIED — when the caller lacks ADMIN / SUPER_ADMIN.
 * @throws {AppError} 404 USER_NOT_FOUND — when the user does not exist.
 */
export const deleteUserController: RequestHandler = async (req, res) => {
  const result = await usersService.deleteUser(req.params.id);
  sendResponse(res, 200, true, 'User deleted successfully', result);
};

/**
 * Generates an invitation link for a prospective teammate.
 * Requires auth and ADMIN / SUPER_ADMIN.
 *
 * @param req.body.email - Invitee email.
 * @param req.body.role - Intended role for the invitee.
 * @returns HTTP 201 with envelope `{ success, message, data }` containing invitation metadata/link.
 * @throws {AppError} 401 ERR_AUTH_INVALID — when JWT auth fails.
 * @throws {AppError} 403 ERR_PERMISSION_DENIED / FORBIDDEN — when role/org context is insufficient.
 * @throws {AppError} 400 INVALID_ROLE — when inviting SUPER_ADMIN.
 * @throws {AppError} 409 EMAIL_TAKEN — when the email is already registered.
 */
export const createInvitationController: RequestHandler = async (req, res) => {
  const invitation = await usersService.generateInvitationLink({
    email: req.body.email,
    role: req.body.role,
    inviterUserId: req.user?.userId ?? '',
    inviterRole: req.user?.role,
    organizationId: req.user?.organizationId,
  });

  sendResponse(res, 201, true, 'Invitation link generated successfully', invitation);
};

/**
 * Verifies an invitation token from the email link (public).
 *
 * @param req.query.token - Invitation JWT to verify.
 * @returns HTTP 200 with envelope `{ success, message, data }` containing invite claims.
 * @throws {AppError} 401 UNAUTHORIZED — when the token is invalid, expired, or malformed.
 * @throws {AppError} 400 VALIDATION_ERROR — when the query is missing/invalid.
 */
export const verifyInvitationController: RequestHandler = async (req, res) => {
  const invite = usersService.verifyInvitationToken(String(req.query.token));
  sendResponse(res, 200, true, 'Invitation token verified successfully', invite);
};

/**
 * Accepts an invitation and creates the user with credentials (public).
 *
 * @param req.body.token - Invitation JWT.
 * @param req.body.name - Display name for the new user.
 * @param req.body.password - Password meeting policy minimum length.
 * @returns HTTP 201 with envelope `{ success, message, data }` containing the created user.
 * @throws {AppError} 401 UNAUTHORIZED — when the invitation token is invalid or expired.
 * @throws {AppError} 409 EMAIL_TAKEN — when the email is already registered.
 * @throws {AppError} 400 VALIDATION_ERROR — when body validation fails.
 */
export const acceptInvitationController: RequestHandler = async (req, res) => {
  const user = await usersService.acceptInvitation({
    token: req.body.token,
    name: req.body.name,
    password: req.body.password,
  });

  sendResponse(res, 201, true, 'Invitation accepted successfully', user);
};

/**
 * Lists users in the caller's organization with cursor pagination.
 * Requires auth and ADMIN / MANAGER / SUPER_ADMIN.
 *
 * @param req.query.limit - Page size (default 20, max 100).
 * @param req.query.cursor - Optional cursor for the next page.
 * @returns HTTP 200 with envelope `{ success, message, data, meta }` (`total`, `hasMore`, `nextCursor`).
 * @throws {AppError} 401 ERR_AUTH_INVALID — when JWT auth fails.
 * @throws {AppError} 403 ERR_PERMISSION_DENIED / FORBIDDEN — when role or organization context is insufficient.
 * @throws {AppError} 400 VALIDATION_ERROR — when query validation fails.
 */
export const listUsersController: RequestHandler = async (req, res) => {
  const query = req.query as unknown as import('./users.validation.js').ListUsersQuery;
  const result = await usersService.listOrganizationUsers({
    organizationId: req.user?.organizationId,
    role: req.user?.role,
    limit: query.limit,
    cursor: query.cursor,
  });

  sendResponse(res, 200, true, 'Users retrieved successfully', result.data, {
    total: result.total,
    hasMore: result.hasMore,
    nextCursor: result.nextCursor,
  });
};

/**
 * Returns the authenticated user's profile.
 * Requires authentication.
 *
 * @returns HTTP 200 with envelope `{ success, message, data }` containing the current user.
 * @throws {AppError} 401 ERR_AUTH_INVALID — when JWT auth fails.
 * @throws {AppError} 404 USER_NOT_FOUND — when the user no longer exists.
 */
export const getCurrentUserController: RequestHandler = async (req, res) => {
  const user = await usersService.getCurrentUser(req.user?.userId ?? '');
  sendResponse(res, 200, true, 'User profile retrieved successfully', user);
};
