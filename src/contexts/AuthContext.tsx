import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '@/services/authService';
import { toast } from '@/hooks/use-toast';

const USER_KEY = 'tw_user';

export interface AuthUser {
  userId: string;
  email: string;
  displayName: string | null;
  avatarUrl?: string | null;
  isAdmin: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  session: null;
  userRole: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<AuthUser>) => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

function loadStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show cached profile instantly while we validate the session with the server
    const cached = loadStoredUser();
    if (cached) setUser(cached);

    authService.me()
      .then(serverUser => {
        const authUser: AuthUser = {
          userId: serverUser.userId,
          email: serverUser.email,
          displayName: serverUser.displayName,
          isAdmin: serverUser.isAdmin,
          avatarUrl: cached?.avatarUrl,
        };
        setUser(authUser);
        localStorage.setItem(USER_KEY, JSON.stringify(authUser));
      })
      .catch(() => {
        // Cookie expired or missing — clear stale cache
        setUser(null);
        localStorage.removeItem(USER_KEY);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      const res = await authService.login(email, password);
      const authUser: AuthUser = {
        userId: res.userId,
        email: res.email,
        displayName: res.displayName,
        isAdmin: res.isAdmin,
      };
      localStorage.setItem(USER_KEY, JSON.stringify(authUser));
      setUser(authUser);
      toast({ title: 'Login realizado com sucesso!', description: 'Bem-vindo de volta.' });
      return { error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login';
      toast({ title: 'Erro no login', description: message, variant: 'destructive' });
      return { error: message };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    displayName?: string,
  ): Promise<{ error: string | null }> => {
    try {
      const res = await authService.register(email, password, displayName);
      const authUser: AuthUser = {
        userId: res.userId,
        email: res.email,
        displayName: res.displayName,
        isAdmin: false,
      };
      localStorage.setItem(USER_KEY, JSON.stringify(authUser));
      setUser(authUser);
      toast({ title: 'Cadastro realizado com sucesso!', description: 'Sua conta foi criada.' });
      return { error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao criar conta';
      toast({ title: 'Erro no cadastro', description: message, variant: 'destructive' });
      return { error: message };
    }
  };

  const signOut = async () => {
    try {
      await authService.logout();
    } catch {
      // Clear state regardless of server response
    }
    localStorage.removeItem(USER_KEY);
    setUser(null);
    toast({ title: 'Logout realizado com sucesso!', description: 'Até logo!' });
  };

  const updateUser = (updates: Partial<AuthUser>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const isAdmin = user?.isAdmin ?? false;
  const userRole = isAdmin ? 'admin' : user ? 'user' : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        session: null,
        userRole,
        isLoading,
        signIn,
        signUp,
        signOut,
        updateUser,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
