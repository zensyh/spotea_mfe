'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@repo/ui/ui/button';
import { Input } from '@repo/ui/ui/input';
import { Label } from '@repo/ui/ui/label';
import { FieldError } from '@repo/ui/components/field-error';
import { EditorialCard } from '@repo/ui/components/editorial-card';
import Link from 'next/link';

import { loginSchema, type LoginFormValues } from './form-model/login.schema';
import { loginDefaultValue } from './form-model/default-value';
import { useLogin } from './hooks/use-login';
import { resolveRoleHome } from '@/shared/lib/resolve-role-home';

const labelClass =
  'font-mono text-[11px] uppercase tracking-wider text-muted-foreground';
const inputClass =
  'rounded-none focus-visible:ring-ring focus-visible:border-ring';

export function LoginForm() {
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get('registered') === '1';
  const { login, loading, error: serverError } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: loginDefaultValue,
  });

  async function onSubmit(values: LoginFormValues) {
    const user = await login(values);
    if (user) {
      window.location.assign(resolveRoleHome(user.role));
    }
  }

  return (
    <EditorialCard showCornerMarks={false} className="w-full max-w-md bg-card p-8">
      <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        <span className="flex items-center gap-2.5">
          <span
            className="pulse-dot inline-block size-2 rounded-full bg-primary"
            aria-hidden="true"
          />
          Login
        </span>
        <span className="text-primary" aria-hidden="true">02</span>
      </div>

      <div className="my-6 h-px bg-border" aria-hidden="true" />

      <div className="space-y-2">
        <h2 className="text-[28px] font-semibold leading-[1.2] tracking-tight text-foreground">
          Welcome back
        </h2>
        <p className="font-light leading-[1.65] text-muted-foreground">
          Sign in to your Spotea account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6" noValidate>
        {justRegistered && !serverError && (
          <div className="border border-border bg-muted p-3 font-mono text-xs uppercase tracking-wider text-foreground">
            Account created — please sign in.
          </div>
        )}

        {serverError && (
          <div className="border border-destructive p-3 font-mono text-xs uppercase tracking-wider text-destructive">
            {serverError}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="username" className={labelClass}>
            Username
          </Label>
          <Input
            id="username"
            placeholder="johndoe"
            autoComplete="username"
            className={inputClass}
            aria-invalid={!!errors.username}
            {...register('username')}
          />
          <FieldError message={errors.username?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className={labelClass}>
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Your password"
              autoComplete="current-password"
              className={`${inputClass} pr-10`}
              aria-invalid={!!errors.password}
              {...register('password')}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          <FieldError message={errors.password?.message} />
        </div>

        <Button
          type="submit"
          variant="outline"
          className="chip-sweep w-full border-primary font-mono text-xs uppercase tracking-wider text-primary"
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Signing in...' : 'Login'}
        </Button>
      </form>

      <div className="mt-8 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        <span>Don&apos;t have an account?</span>
        <Link href="/register" className="group relative text-primary">
          Register
          <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
        </Link>
      </div>
    </EditorialCard>
  );
}
