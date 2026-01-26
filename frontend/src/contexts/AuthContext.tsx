import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { User, AuthState, AuthResponse } from '@/types/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ error?: string }>;
  register: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(TOKEN_KEY);
      return stored ? stored.trim() : null;
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  const saveToken = useCallback((newToken: string) => {
    const cleanToken = newToken.trim();
    localStorage.setItem(TOKEN_KEY, cleanToken);
    setToken(cleanToken);
  }, []);

  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const cleanToken = storedToken.trim();
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setToken(cleanToken);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Falha na validação do token:', err);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);

  const login = useCallback(
    async (
      email: string,
      password: string,
      rememberMe: boolean = false,
    ): Promise<{ error?: string }> => {
      try {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, rememberMe }),
        });

        const data = await res.json();

        if (!res.ok) {
          return { error: data.error || 'Falha no login' };
        }

        const authData = data as AuthResponse;
        saveToken(authData.token);
        setUser(authData.user);
        return {};
      } catch (err) {
        return { error: 'Erro de rede. Por favor, tente novamente.' };
      }
    },
    [saveToken],
  );

  const register = useCallback(
    async (email: string, password: string): Promise<{ error?: string }> => {
      try {
        const res = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          return { error: data.error || 'Falha no registro' };
        }

        const authData = data as AuthResponse;
        saveToken(authData.token);
        setUser(authData.user);
        return {};
      } catch (err) {
        return { error: 'Erro de rede. Por favor, tente novamente.' };
      }
    },
    [saveToken],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
