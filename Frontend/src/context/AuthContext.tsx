/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { authClient } from "../lib/auth-client";
import type { User, Session, UserRole } from "../types/auth";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data, isPending } = authClient.useSession();

  // Cast the returned user/session to our defined interfaces
  const user = data?.user ? (data.user as unknown as User) : null;
  const session = data?.session ? (data.session as unknown as Session) : null;
  const role = user?.role || null;
  const isAuthenticated = !!session;
  const isLoading = isPending;

  const logout = async () => {
    await authClient.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        isAuthenticated,
        isLoading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
