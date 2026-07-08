import Link from 'next/link';

export function LoginBanner() {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold text-foreground">Spotea</h1>
      <p className="mt-2 text-muted-foreground">
        Temukan kafe terbaik di sekitarmu
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        Belum punya akun?{' '}
        <Link
          href="/register"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Daftar di sini
        </Link>
      </p>
    </div>
  );
}
