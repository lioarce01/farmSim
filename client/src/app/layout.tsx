'use client';

import { ReactNode, useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../redux/store/store'; // Ajusta la ruta según tu estructura de carpetas
import './globals.css'; // Asegúrate de que esta ruta sea correcta
import { Auth0Provider } from '@auth0/auth0-react';
import AuthWrapper from 'src/components/authWrapper'; // Importa el AuthWrapper
import { hydrate } from 'src/redux/slices/authSlice';
import { useDispatch } from 'react-redux';

const RootLayout = ({ children }: { children: ReactNode }) => {
  const redirectUri = typeof window !== "undefined" ? window.location.origin : undefined;

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
            >
              <AuthWrapper>
                <HydrateUser />
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

const HydrateUser = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const restoreState = async () => {
      await persistor.flush();
      const storedState = store.getState().auth;
      console.log('Stored state from localStorage:', storedState);
      dispatch(hydrate(storedState));
    };

    restoreState();
  }, [dispatch]);

  return null; // Este componente no necesita renderizar nada
};

export default RootLayout;