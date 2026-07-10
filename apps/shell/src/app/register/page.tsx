import Link from 'next/link';
import { RegisterForm } from '@/features/auth/register/register-form';

export default function RegisterPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-8 px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Spotea</h1>
        <p className="mt-2 text-muted-foreground">
          Buat akun baru dan mulai jelajahi kafe
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Sudah punya akun?{' '}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Login di sini
          </Link>
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
