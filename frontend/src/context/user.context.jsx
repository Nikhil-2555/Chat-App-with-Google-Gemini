import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from '../config/axios';

// Create the User Context
export const UserContext = createContext();

// Custom hook to use the UserContext
export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

// UserProvider component
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check if user is already logged in on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Fetch user profile
            fetchUserProfile();
        } else {
            setLoading(false);
        }
    }, []);

    // Fetch user profile
    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/users/profile', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUser(response.data.user);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Error fetching user profile:', error);
            // If token is invalid, clear it
            localStorage.removeItem('token');
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    // Login function
    const login = async (email, password) => {
        try {
            const response = await axios.post('/users/login', { email, password });
            const { user, token } = response.data;

            localStorage.setItem('token', token);
            setUser(user);
            setIsAuthenticated(true);

            return { success: true, user };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Login failed'
            };
        }
    };

    // Register function
    const register = async (username, email, password) => {
        try {
            const response = await axios.post('/users/register', {
                username,
                email,
                password
            });
            const { user, token } = response.data;

            localStorage.setItem('token', token);
            setUser(user);
            setIsAuthenticated(true);

            return { success: true, user };
        } catch (error) {
            console.error('Registration error:', error);
            console.log('Error response:', error.response?.data);
            return {
                success: false,
                error: error.response?.data?.errors?.[0]?.msg || 'Registration failed'
            };
        }
    };

    // Logout function
    const logout = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.get('/users/logout', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        fetchUserProfile
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};
