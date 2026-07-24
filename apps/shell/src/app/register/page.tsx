import { redirect } from 'next/navigation';
import { verifySession } from '@repo/auth';
import { resolveRoleHome } from '@/shared/lib/resolve-role-home';
import RegisterPage from '@/features/auth/register/register-page';

export default async function Register() {
  const session = await verifySession();
  if (session) {
    redirect(resolveRoleHome(session.user.role));
  }
  return <RegisterPage />;
}
