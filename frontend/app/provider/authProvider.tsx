"use client";

import {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "@/lib/api/auth";
import type {
  LoginRequest,
  RegisterRequest,
  User,
} from "@/app/(auth)/auth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<User>;
  register: (information: RegisterRequest) => Promise<User>;
  logout: () => Promise<void>;
  updateCurrentUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void getCurrentUser()
      .catch(() => null)
      .then((currentUser) => {
        if (!cancelled) {
          setUser(currentUser);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function login(credentials: LoginRequest) {
    const authenticatedUser = await loginUser(credentials);
    setUser(authenticatedUser);

    return authenticatedUser;
  }

  async function register(information: RegisterRequest) {
    return registerUser(information);
  }

  async function logout() {
    await logoutUser();
    setUser(null);
  }

  function updateCurrentUser(updatedUser: User) {
    setUser(updatedUser);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
