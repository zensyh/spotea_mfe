import React, { Suspense } from 'react';
import { LoginForm } from '@/features/auth/login/components/form/login-form';
import LoginBanner from '@/features/auth/login/components/sections/login-banner';

const LoginPage = () => {
  return (
    <main className="grid min-h-screen grid-cols-1 bg-background sm:grid-cols-[1.05fr_1fr]">
      <div className="relative z-0 hidden min-h-screen sm:block">
        <LoginBanner />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col bg-background">
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:py-16 lg:px-12">
          <div className="w-full max-w-md sm:-ml-16 lg:-ml-24">
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
