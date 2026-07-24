import { redirect } from 'next/navigation';
import { verifySession } from '@repo/auth';
import { resolveRoleHome } from '@/shared/lib/resolve-role-home';
import LoginPage from '@/features/auth/login/login-page';

export default async function Login() {
  const session = await verifySession();
  if (session) {
    redirect(resolveRoleHome(session.user.role));
  }
  return <LoginPage />;
}
