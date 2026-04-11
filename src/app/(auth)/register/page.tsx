import type { Metadata } from 'next';
import RegisterForm from './register-form';

export const metadata: Metadata = {
  title: 'Create Account — Grey Sky Responder Society',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
