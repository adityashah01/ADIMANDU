import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);
const API_URL = '/api';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const res = await fetch(`${API_URL}/auth/me`, {
                credentials: 'include',
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    const logout = async () => {
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        });
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, refreshUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
}