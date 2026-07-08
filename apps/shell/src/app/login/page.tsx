import { LoginBanner } from '@/features/_components/login-banner/login-banner';
import { LoginForm } from '@/features/_components/login-form/login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-8 px-4">
      <LoginBanner />
      <LoginForm />
    </div>
  );
}
