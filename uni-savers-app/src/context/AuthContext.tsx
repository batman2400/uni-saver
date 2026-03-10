import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';

type User = {
    id: string;
    email: string;
    name: string;
    role: string;
    verificationStatus: string;
};

type AuthContextType = {
    user: User | null;
    isLoading: boolean;
    login: (token: string, userData: User) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (partial: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStoredData();
    }, []);

    const loadStoredData = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const userDataString = await AsyncStorage.getItem('userData');

            if (token && userDataString) {
                setUser(JSON.parse(userDataString));
                // Optional: Verify token with backend here
            }
        } catch (error) {
            console.error('Error loading auth data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (token: string, userData: User) => {
        try {
            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
            setUser(userData);
        } catch (error) {
            console.error('Error storing auth data', error);
        }
    };

    const updateUser = async (partial: Partial<User>) => {
        try {
            const updated = user ? { ...user, ...partial } : null;
            if (updated) {
                await AsyncStorage.setItem('userData', JSON.stringify(updated));
                setUser(updated);
            }
        } catch (error) {
            console.error('Error updating user data', error);
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');
            setUser(null);
        } catch (error) {
            console.error('Error removing auth data', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
