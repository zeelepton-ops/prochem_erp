import React, { ReactNode, useEffect } from 'react';
import { useAuthStore } from './authStore';
import { authService } from '@services/authService';

interface AuthContextProviderProps {
  children: ReactNode;
}

export const AuthContextProvider: React.FC<AuthContextProviderProps> = ({ children }) => {
  const token = useAuthStore((state) => state.token);
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    if (token && !useAuthStore.getState().user) {
      authService
        .getProfile()
        .then((user) => {
          setAuth(user, token);
        })
        .catch(() => {
          useAuthStore.getState().logout();
        });
    }
  }, [token, setAuth]);

  return <>{children}</>;
};
