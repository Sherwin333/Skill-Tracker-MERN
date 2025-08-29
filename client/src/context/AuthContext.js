// client/src/context/AuthContext.js
import { createContext, useContext, useEffect } from 'react';
import { create } from 'zustand';

// 1. Create a Zustand store
const useAuthStore = create((set) => ({
    token: localStorage.getItem('token') || null,
    user: null, // We'll fetch this from /api/auth/me
    isAuthenticated: !!localStorage.getItem('token'),
    loading: true, // For initial token check

    setToken: (token) => {
        if (token) {
            localStorage.setItem('token', token);
            set({ token, isAuthenticated: true });
        } else {
            localStorage.removeItem('token');
            set({ token: null, isAuthenticated: false });
        }
    },
    setUser: (user) => set({ user }),
    setLoading: (loading) => set({ loading }),
    logout: () => {
        localStorage.removeItem('token');
        set({ token: null, user: null, isAuthenticated: false });
    },
}));

// 2. Create a React Context to provide the store and a method to fetch user
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const { token, setToken, setUser, setLoading, logout } = useAuthStore();

    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    const res = await fetch('/api/auth/me', {
                        headers: {
                            'x-auth-token': token,
                        },
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setUser(data);
                    } else {
                        // Token might be invalid or expired
                        logout();
                    }
                } catch (err) {
                    console.error('Error loading user:', err);
                    logout();
                }
            }
            setLoading(false);
        };

        loadUser();
    }, [token, setUser, logout, setLoading]); // Depend on token to re-load if it changes

    return (
        <AuthContext.Provider value={{ useAuthStore }}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. Custom hook to use the auth store
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context.useAuthStore();
};