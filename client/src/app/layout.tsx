'use client'

import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '../redux/store/store'; // Ajusta la ruta según tu estructura de carpetas
import Navbar from 'src/components/Navbar';
import './globals.css'; // Asegúrate de que esta ruta sea correcta
import { Auth0Provider } from '@auth0/auth0-react';
import AuthWrapper from 'src/components/authWrapper'; // Importa el AuthWrapper
import { useRouter } from 'next/router';

const RootLayout = ({ children }: { children: ReactNode }) => {
  const redirectUri = typeof window !== "undefined" ? window.location.origin : undefined;

  return (
    <html lang="en">
      <body className='text-gray-800'>
        <Provider store={store}>
          <Auth0Provider
            domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN!}
            clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!}
            authorizationParams={{
              redirect_uri: redirectUri
            }}
          >
            <AuthWrapper>
              <div className='bg-[#FFF5D1] min-h-screen'>
                {children}
              </div>
            </AuthWrapper>
          </Auth0Provider>
        </Provider>
      </body>
    </html>
  );
};

export default RootLayout;