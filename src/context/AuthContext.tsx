"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
    id: number;
    email: string;
    balance: string | number; // API returns string "0" based on user input
    createdAt: string;
    wonAuctions: any[]; // Define a stricter type if structure is known
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (token: string, userData?: User) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const fetchUser = async (token: string) => {
        try {
            const response = await fetch("https://krystal-solutional-cherish.ngrok-free.dev/users/me", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "ngrok-skip-browser-warning": "true",
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Fetched user data:", data);
                // API returns the user object directly based on user's input example
                setUser(data);
            } else {
                console.error("Failed to fetch user details");
            }
        } catch (error) {
            console.error("Error fetching user details:", error);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setIsAuthenticated(true);
            fetchUser(token);
        }
        setIsLoading(false);
    }, []);

    const login = (token: string, userData?: User) => {
        localStorage.setItem("token", token);
        setIsAuthenticated(true);
        if (userData) {
            setUser(userData);
        } else {
            fetchUser(token);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setUser(null);
        router.push("/");
    };

    const refreshUser = async () => {
        const token = localStorage.getItem("token");
        if (token) {
            await fetchUser(token);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout, refreshUser, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
