import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type User = {
    id: string;
    email: string;
    name: string;
} | null;

type AuthContextType = {
    user: User;
    isLoading: boolean;
    signIn: (email?: string, password?: string) => Promise<void>;
    signUp: (name?: string, email?: string, password?: string) => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Simulate loading checking if user is logged in
    useEffect(() => {
        const checkUser = async () => {
            setIsLoading(true);
            // Simulate network wait
            await new Promise((resolve) => setTimeout(resolve, 500));
            // For dummy purpose, not persisting automatically
            setUser(null);
            setIsLoading(false);
        };

        checkUser();
    }, []);

    const signIn = async (email?: string, password?: string) => {
        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));
        setUser({ id: '1', email: email || 'user@example.com', name: 'Test User' });
        setIsLoading(false);
    };

    const signUp = async (name?: string, email?: string, password?: string) => {
        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));
        setUser({ id: '1', email: email || 'user@example.com', name: name || 'Test User' });
        setIsLoading(false);
    };

    const signOut = async () => {
        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        setUser(null);
        setIsLoading(false);
    };

    const resetPassword = async (email: string) => {
        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));
        setIsLoading(false);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, resetPassword }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
