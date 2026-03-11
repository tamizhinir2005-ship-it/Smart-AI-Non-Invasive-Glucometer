import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkLoggedIn = async () => {
            let token = localStorage.getItem('token');
            if (!token) token = sessionStorage.getItem('token');

            if (token) {
                axios.defaults.headers.common['x-auth-token'] = token; // Actually backend needs Authorization header mostly, but let's stick to standard practice, maybe x-auth-token is what I used? No, I haven't implemented middleware yet.
                // Assuming backend uses x-auth-token or Bearer.
                // I will use x-auth-token for now as it's simpler with some stacks, or standard Bearer.
                // I'll stick to x-auth-token as per simple implementations unless I defined it differently.
                // Wait, I haven't defined middleware. I should define middleware in backend later.

                try {
                    // Verify token and get user
                    const res = await axios.get('http://localhost:5000/api/auth/me');
                    setUser(res.data);
                    setIsAuthenticated(true);
                } catch (err) {
                    localStorage.removeItem('token');
                    sessionStorage.removeItem('token');
                    setIsAuthenticated(false);
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkLoggedIn();
    }, []);

    const login = async (email, password, rememberMe) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            const { token, isProfileComplete } = res.data;

            if (rememberMe) {
                localStorage.setItem('token', token);
            } else {
                sessionStorage.setItem('token', token);
            }

            axios.defaults.headers.common['x-auth-token'] = token;

            // Fetch user data
            const userRes = await axios.get('http://localhost:5000/api/auth/me');
            setUser(userRes.data);

            setIsAuthenticated(true);
            return { success: true, isProfileComplete };
        } catch (err) {
            return { success: false, msg: err.response?.data?.msg || 'Login failed' };
        }
    };

    const register = async (email, password) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', { email, password });
            const { token, isProfileComplete } = res.data;

            sessionStorage.setItem('token', token);
            axios.defaults.headers.common['x-auth-token'] = token;

            // Fetch user data
            const userRes = await axios.get('http://localhost:5000/api/auth/me');
            setUser(userRes.data);

            setIsAuthenticated(true);
            return { success: true, isProfileComplete };
        } catch (err) {
            console.error('Registration Error:', err);
            return { success: false, msg: err.response?.data?.msg || 'Registration failed' };
        }
    };


    const updateProfile = async (data) => {
        try {
            // Ensure we map any legacy or alternative names back to schema fields if needed, 
            // but Profile.jsx now uses the correct ones.
            const res = await axios.put('http://localhost:5000/api/auth/profile', data);
            setUser(res.data);
            return { success: true };
        } catch (err) {
            console.error('Update Profile Error:', err);
            return { success: false, msg: err.response?.data?.msg || 'Update failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        delete axios.defaults.headers.common['x-auth-token'];
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
