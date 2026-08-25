import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);

        // auto logout when token expires
        const checkExpiry = () => {
            const t = localStorage.getItem('token');
            if (t) {
                try {
                    const payload = JSON.parse(atob(t.split('.')[1]));
                    if (payload.exp && payload.exp * 1000 < Date.now()) {
                        logout();
                        window.location.href = '/login';
                    }
                } catch (e) {
                    console.error('failed to decode token', e);
                }
            }
        };
        const interval = setInterval(checkExpiry, 60000); // every minute
        return () => clearInterval(interval);
    }, []);

    const login = async (username, password) => {
        const response = await api.post('/auth/login', { username, password });
        const { token, role, userId } = response.data;

        // Store token and user details
        localStorage.setItem('token', token);
        const userData = { username, role, userId };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const isAuthenticated = () => !!user;
    const isAdmin = () => user?.role === 'ADMIN';

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated, isAdmin }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
