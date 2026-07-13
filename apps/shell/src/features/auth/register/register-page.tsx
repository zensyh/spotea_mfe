import React from 'react';
import { RegisterForm } from '@/features/auth/register/components/form/register-form';
import RegisterBanner from '@/features/auth/register/components/sections/register-banner';

const RegisterPage = () => {
  return (
    <main className="grid min-h-screen grid-cols-1 bg-background sm:grid-cols-[1.05fr_1fr]">
      <div className="relative z-0 hidden min-h-screen sm:block">
        <RegisterBanner />
      </div>
      <div className="relative z-0 flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <RegisterForm />
      </div>
    </main>
  );
};

export default RegisterPage;
