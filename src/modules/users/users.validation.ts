import { z } from 'zod';
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MIN_LENGTH_MESSAGE,
  UserRole,
} from '../../shared/constants/index.js';

/**
 * Body schema for `POST /api/users` and `POST /api/users/team`.
 *
 * Business domain: admin provisioning of org users. Role defaults to VIEWER so
 * least privilege applies unless an admin explicitly elevates the account.
 */
export const CreateUserBodySchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.nativeEnum(UserRole).default(UserRole.VIEWER),
});

/**
 * Body schema for `POST /api/users/invitations`.
 *
 * Business domain: invite a teammate by email with an intended role before they
 * set a password. Role is required (no default) so invitations never silently
 * create elevated accounts without an explicit admin choice.
 */
export const CreateInvitationBodySchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(UserRole),
});

/**
 * Query schema for `GET /api/users/invitations/verify`.
 *
 * Business domain: validate an invitation token from the email link before the
 * accept UI collects name/password — avoids starting accept with a dead token.
 */
export const VerifyInvitationQuerySchema = z.object({
  token: z.string().trim().min(1),
});

/**
 * Body schema for `POST /api/users/invitations/accept`.
 *
 * Business domain: convert a pending invitation into a real user with credentials.
 * Password policy matches signup so invited users cannot bypass length requirements.
 */
export const AcceptInvitationBodySchema = z.object({
  token: z.string().trim().min(1),
  name: z.string().trim().min(1),
  password: z.string().min(PASSWORD_MIN_LENGTH, PASSWORD_MIN_LENGTH_MESSAGE),
});

/**
 * Query schema for `GET /api/users`.
 *
 * Business domain: admin/manager user directory listing with cursor pagination.
 * Cursor mode is preferred for growing org directories; limit is capped at 100
 * to keep directory responses UI-friendly. `.strict()` rejects unknown query keys
 * so typos (e.g. `page` instead of `cursor`) fail loudly rather than being ignored.
 */
export const ListUsersQuerySchema = z
  .object({
    limit: z.coerce.number().min(1).max(100).default(20),
    cursor: z.string().optional(),
  })
  .strict();

export type ListUsersQuery = z.infer<typeof ListUsersQuerySchema>;
