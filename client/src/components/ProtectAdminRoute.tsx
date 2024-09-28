"use client"; // Asegúrate de que este archivo se ejecute en el cliente

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RootState } from '../redux/store/store'; // Asegúrate de importar el tipo RootState correctamente
import { useSelector } from 'react-redux';

const ProtectAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  const [isRedirecting, setIsRedirecting] = useState(false); // Estado para controlar la redirección

  useEffect(() => {
    // Verifica el estado del usuario
    if (user?.role !== 'ADMIN' && !isRedirecting) {
      setIsRedirecting(true); // Cambia el estado para evitar redirecciones infinitas
      router.push('/403'); // Redirige a la página 403
    }
  }, [user, isRedirecting, router]);

  // Si el usuario no es admin, no renderiza nada
  if (user?.role !== 'ADMIN') {
    return null;
  }

  // Si es admin, muestra el contenido protegido
  return <>{children}</>;
};

export default ProtectAdminRoute;
