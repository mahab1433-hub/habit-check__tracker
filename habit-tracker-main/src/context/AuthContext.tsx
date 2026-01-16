import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    _id: string;
    name: string;
    email: string;
    token: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (userData: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('auth_user_data');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                localStorage.removeItem('auth_user_data');
            }
        }
        setLoading(false);
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem('auth_user_data', JSON.stringify(userData));
        localStorage.setItem('auth_user', 'true'); // For backward compatibility
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('auth_user_data');
        localStorage.removeItem('auth_user');
        window.location.href = '/'; // Simple redirect
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
