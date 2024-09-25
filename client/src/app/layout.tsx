'use client';

import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../redux/store/store'; // Ajusta la ruta según tu estructura
import './globals.css';
import { Auth0Provider } from '@auth0/auth0-react';
import AuthWrapper from 'src/components/authWrapper'; // Importa el AuthWrapper

const RootLayout = ({ children }: { children: ReactNode }) => {
  const redirectUri = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <html lang="en">
      <body className='text-gray-800'>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <Auth0Provider
              domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN!}
              clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!}
              authorizationParams={{
                redirect_uri: redirectUri,
              }}
              useRefreshTokens={true}
              cacheLocation="localstorage"
            >
              <AuthWrapper>
                <div className='bg-[#FFF5D1] min-h-screen'>
                  {children}
                </div>
              </AuthWrapper>
            </Auth0Provider>
          </PersistGate>
        </Provider>
      </body>
    </html>
  );
};

export default RootLayout;
