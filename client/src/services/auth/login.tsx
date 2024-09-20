'use client'

import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void;
}

const LoginButton: React.FC<ButtonProps> = ({children, onClick}) => {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  if (user) {
    return (
      <Link href="/api/auth/logout">
        <button onClick={onClick} className="px-4 py-2 bg-red-500 text-white rounded">{children}</button>
      </Link>
    );
  }

  return (
    <Link href="/api/auth/login">
      <button onClick={onClick} className="px-4 py-2 bg-blue-500 text-white rounded">{children}</button>
    </Link>
  );
};

export default LoginButton;