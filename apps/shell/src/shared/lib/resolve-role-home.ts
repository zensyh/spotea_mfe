import type { User } from '@repo/auth';

const ROLE_BASE_PATH: Record<User['role'], string> = {
  CUSTOMER: '/consumer',
  MERCHANT: '/merchant',
  ADMIN: '/admin',
};

export function resolveRoleHome(role: User['role']): string {
  return `${ROLE_BASE_PATH[role] ?? ''}`;
}
