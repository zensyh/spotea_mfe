'use client';

import { useRef, type FormEvent, type ReactNode } from 'react';

interface FormGuardProps {
  action: string;
  children: ReactNode;
}

export function FormGuard({ action, children }: FormGuardProps) {
  const pending = useRef(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    if (pending.current) {
      e.preventDefault();
      return;
    }
    pending.current = true;
  };

  return (
    <form action={action} method="POST" onSubmit={handleSubmit}>
      {children}
    </form>
  );
}
