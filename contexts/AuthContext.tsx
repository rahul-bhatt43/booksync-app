import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import apiClient from '../api/client';

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
            try {
                const token = await AsyncStorage.getItem('authToken');
                const userData = await AsyncStorage.getItem('userData');
                if (token && userData) {
                    setUser(JSON.parse(userData));
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Failed to load local user data', error);
                setUser(null);
            }
            setIsLoading(false);
        };

        checkUser();
    }, []);

    const signIn = async (email?: string, password?: string) => {
        if (!email || !password) throw new Error('Email and password required');
        setIsLoading(true);
        try {
            const response = await apiClient.post('/auth/login', { email, password });
            const { token, user: userData } = response.data.data;
            const userToSet = { ...userData, id: userData._id };
            await AsyncStorage.setItem('authToken', token);
            await AsyncStorage.setItem('userData', JSON.stringify(userToSet));
            setUser(userToSet);
        } catch (error) {
            console.error('Login error', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const signUp = async (name?: string, email?: string, password?: string) => {
        if (!name || !email || !password) throw new Error('Name, email and password required');
        setIsLoading(true);
        try {
            const response = await apiClient.post('/auth/register', { name, email, password });
            const { token, user: userData } = response.data.data;
            const userToSet = { ...userData, id: userData._id };
            await AsyncStorage.setItem('authToken', token);
            await AsyncStorage.setItem('userData', JSON.stringify(userToSet));
            setUser(userToSet);
        } catch (error) {
            console.error('Signup error', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const signOut = async () => {
        setIsLoading(true);
        try {
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('userData');
            setUser(null);
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            setIsLoading(false);
        }
    };

    const resetPassword = async (email: string) => {
        setIsLoading(true);
        // Simulate API call, not provided in endpoints. Keep as stub.
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
