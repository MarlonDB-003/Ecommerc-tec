import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '@/services/authService';
import { toast } from '@/hooks/use-toast';

const TOKEN_KEY = 'tw_token';
const USER_KEY = 'tw_user';

export interface AuthUser {
  userId: string;
  email: string;
  displayName: string | null;
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

function storeSession(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = loadStoredUser();
    setUser(stored);
    setIsLoading(false);
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
      storeSession(res.token, authUser);
      setUser(authUser);

      toast({
        title: 'Login realizado com sucesso!',
        description: 'Bem-vindo de volta.',
      });

      return { error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login';
      toast({
        title: 'Erro no login',
        description: message,
        variant: 'destructive',
      });
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
      storeSession(res.token, authUser);
      setUser(authUser);

      toast({
        title: 'Cadastro realizado com sucesso!',
        description: 'Sua conta foi criada.',
      });

      return { error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao criar conta';
      toast({
        title: 'Erro no cadastro',
        description: message,
        variant: 'destructive',
      });
      return { error: message };
    }
  };

  const signOut = async () => {
    clearSession();
    setUser(null);
    toast({
      title: 'Logout realizado com sucesso!',
      description: 'Até logo!',
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
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
