import { useEffect, useMemo, useState } from 'react';
import { login, logout, refreshAuth, signup } from '../services/api.js';

const AUTH_KEY = 'skycast-auth';

function readStoredAuth() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY)) || null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [auth, setAuth] = useState(readStoredAuth);

  useEffect(() => {
    if (auth) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  }, [auth]);

  const value = useMemo(() => ({
    user: auth?.user || null,
    accessToken: auth?.accessToken || null,
    refreshToken: auth?.refreshToken || null,
    async signup(payload) {
      const nextAuth = await signup(payload);
      setAuth(nextAuth);
      return nextAuth;
    },
    async login(payload) {
      const nextAuth = await login(payload);
      setAuth(nextAuth);
      return nextAuth;
    },
    async refreshAccessToken() {
      if (!auth?.refreshToken) {
        throw new Error('Please log in again');
      }
      const nextAuth = await refreshAuth(auth.refreshToken);
      setAuth(nextAuth);
      return nextAuth.accessToken;
    },
    async logout() {
      await logout(auth?.refreshToken).catch(() => {});
      setAuth(null);
    },
  }), [auth]);

  return value;
}
