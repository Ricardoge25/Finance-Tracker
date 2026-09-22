'use client';

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getToken, setToken, removeToken } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const publicRoutes = ["/login", "/register"];

  useEffect(() => {
    async function initAuth() {
      const token = getToken();

      if (!token) {
        if (!publicRoutes.includes(pathname)) {
          router.push("/login");
        }
        setLoading(false);
        return;
      }

      try {
        const currentUser = await apiFetch("/auth/me");
        setUser(currentUser);

        if (publicRoutes.includes(pathname)) {
          router.push("/dashboard");
        }
      } catch (error) {
        // Token inválido o expirado - limpiamos y mandamos a login
        removeToken();
        setUser(null);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, [pathname]);

  const login = async (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    router.push("/dashboard");
  };

  const logout = () => {
    removeToken();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);