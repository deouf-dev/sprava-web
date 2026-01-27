"use client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getToken, clearToken, setToken } from "@/lib/auth/token";
import { apiFetch } from "../api/apiFetch";

type AuthContextValue = {
    token: string | null,
    isAuthenticated: boolean,
    login: (token: string, userId: number | null, username: string | null) => void,
    logout: () => void,
    isReady: boolean,
    userId: number | null,
    username: string | null,
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setAuthToken] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const saved = getToken();
        setAuthToken(saved);
        if (saved) {
            try {
                apiFetch("/me", {
                    method: "GET",
                    token: saved,
                }).then((data) => {
                    setUserId(data.user_id);
                    setUsername(data.username);
                })

            } catch (err) {
                console.error("Failed to fetch user data:", err);
                clearToken();
                setAuthToken(null);
            } finally {
                setIsReady(true);
            }
        }
        setIsReady(true);
    }, []);

    const login = (newToken: string, newUserId: number | null, newUsername: string | null) => {
        setToken(newToken);
        setAuthToken(newToken);
        setUserId(newUserId);
        setUsername(newUsername);
        setIsReady(true);
    };
    
    const logout = () => {
        clearToken();
        setAuthToken(null);
        setUserId(null);
        setUsername(null);
    };
    const isAuthenticated = !!token;

    const value = useMemo(() => ({token, isAuthenticated, login, logout, isReady, userId, username}), [token, isAuthenticated, isReady, userId, username]);

    return (<AuthContext.Provider value={value}>{children}</AuthContext.Provider>)
    
};

export const useAuth = (): AuthContextValue => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};