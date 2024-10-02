"use client"; // Asegúrate de que este archivo se ejecute en el cliente

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RootState } from '../redux/store/store'; // Asegúrate de importar el tipo RootState correctamente
import { useSelector } from 'react-redux';

const ProtectAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  const [isRedirecting, setIsRedirecting] = useState(false); // Estado para controlar la redirección

  useEffect(() => {
    if (user?.role !== 'ADMIN' && !isRedirecting) {
      setIsRedirecting(true);
      router.push('/403');
    }
  }, [user, isRedirecting, router]);

  if (user?.role !== 'ADMIN') {
    return null;
  }

  return <>{children}</>;
};

export default ProtectAdminRoute;
