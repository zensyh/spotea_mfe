import type { User } from '@repo/auth';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost';

const ROLE_BASE_PATH: Record<User['role'], string> = {
  CUSTOMER: '/consumer',
  MERCHANT: '/merchant',
  ADMIN: '/admin',
};

// export function resolveRoleHome(role: User['role']): string {
//   return `${APP_URL}${ROLE_BASE_PATH[role] ?? ''}`;
// }

export function resolveRoleHome(role: User['role']): string {
  return `${ROLE_BASE_PATH[role] ?? ''}`;
}
