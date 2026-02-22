import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: number;
    username: string;
    email: string;
    full_name: string;
    bio?: string;
    hobbies?: string[];
    interests?: string[];
    avatar_url?: string;
    is_active: boolean;
    created_at: string;
    
    // Personal preferences for AI trip planning
    gender?: string;
    preferred_countries?: string[];
    vacation_types?: string[];
    travel_style?: string;
    age_range?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            login: (token: string, user: User) => {
                set({ token, user, isAuthenticated: true });
            },
            logout: () => {
                set({ token: null, user: null, isAuthenticated: false });
            },
            updateUser: (user: User) => {
                set({ user });
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);
