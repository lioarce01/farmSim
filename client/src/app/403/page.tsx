"use client"; // Asegúrate de que este archivo se ejecute en el cliente

import { useRouter } from 'next/navigation';

const Page403 = () => {
  const router = useRouter(); // Obtiene el router de Next.js

  const handleRedirect = () => {
    router.push('/Home'); // Redirige al home
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold text-red-600">403 - Acceso Denegado</h1>
      <p className="text-lg mt-4">No tienes los permisos necesarios para acceder a esta página.</p>
      <button
        onClick={handleRedirect}
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
      >
        Ir al Inicio
      </button>
    </div>
  );
};

export default Page403;
