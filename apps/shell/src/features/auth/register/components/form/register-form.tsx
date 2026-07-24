'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@repo/ui/ui/button';
import { Input } from '@repo/ui/ui/input';
import { Label } from '@repo/ui/ui/label';
import { FieldError } from '@repo/ui/components/field-error';
import { EditorialCard } from '@repo/ui/components/editorial-card';

import {
  registerSchema,
  type RegisterFormValues,
} from './form-model/register.schema';
import { registerDefaultValue } from './form-model/default-value';
import { useRegister } from './hooks/use-register';
import Link from 'next/link';
import { OrnamentGrid } from '@repo/ui/components/ornament-grid';

const labelClass =
  'font-mono text-[11px] uppercase tracking-wider text-muted-foreground';
const inputClass =
  'rounded-none focus-visible:ring-ring focus-visible:border-ring';

export function RegisterForm() {
  const { onSubmit, loading, error: serverError } = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: registerDefaultValue,
  });

  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 text-foreground"
        aria-hidden="true"
      >
        <OrnamentGrid
          variant="lines"
          cellSize={72}
          lineColor="currentColor"
          lineOpacity={0.06}
        />
      </div>
      <EditorialCard
        showCornerMarks={true}
        className="w-full max-w-md bg-card p-8"
      >
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <span className="flex items-center gap-2.5">
            <span
              className="pulse-dot inline-block size-2 rounded-full bg-primary"
              aria-hidden="true"
            />
            Register
          </span>
        </div>

        <hr className="my-6 h-px bg-border" />

        <div className="space-y-2">
          <h2 className="text-[28px] font-semibold leading-[1.2] tracking-tight text-foreground">
            Create your account
          </h2>
          <p className="font-light leading-[1.65] text-muted-foreground">
            Join Spotea and start finding cafes you’ll love.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-6"
          noValidate
        >
          {serverError && (
            <div className="border border-destructive p-3 font-mono text-xs uppercase tracking-wider text-destructive">
              {serverError}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className={labelClass}>
              Full Name
            </Label>
            <Input
              id="name"
              placeholder="John Doe"
              autoComplete="name"
              className={inputClass}
              aria-invalid={!!errors.name}
              {...register('name')}
            />
            <FieldError message={errors.name?.message} />
          </div>

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
            <Label htmlFor="email" className={labelClass}>
              Email
              {/*<span className="text-muted-foreground/70">(optional)</span>*/}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              autoComplete="email"
              className={inputClass}
              aria-invalid={!!errors.email}
              {...register('email')}
            />
            <FieldError message={errors.email?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className={labelClass}>
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                autoComplete="new-password"
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className={labelClass}>
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                className={`${inputClass} pr-10`}
                aria-invalid={!!errors.confirmPassword}
                {...register('confirmPassword')}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            <FieldError message={errors.confirmPassword?.message} />
          </div>

          <Button
            type="submit"
            variant="outline"
            className="chip-sweep w-full border-primary font-mono text-xs uppercase tracking-wider text-primary"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </form>

        <div className="mt-8 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          <span>Already have an account?</span>
          <Link href="/login" className="group relative text-primary">
            Log in
            <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
          </Link>
        </div>
      </EditorialCard>
    </>
  );
}
