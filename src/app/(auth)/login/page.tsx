import type { Metadata } from 'next';
import { Suspense } from 'react';
import LoginForm from './login-form';

export const metadata: Metadata = {
  title: 'Sign In — Grey Sky Responder Society',
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
