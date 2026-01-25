'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeType = 'dark' | 'light' | 'custom';

interface ThemeContextType {
    theme: ThemeType;
    accentColor: string;
    setTheme: (theme: ThemeType) => Promise<void>;
    setAccentColor: (color: string) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<ThemeType>('dark');
    const [accentColor, setAccentColorState] = useState<string>('blue');
    const [isLoaded, setIsLoaded] = useState(false);

    // Load theme from localStorage and database
    useEffect(() => {
        const loadTheme = async () => {
            try {
                // Try to get from local storage first
                const stored = localStorage.getItem('theme');
                const storedAccent = localStorage.getItem('accentColor');

                if (stored && (stored === 'dark' || stored === 'light' || stored === 'custom')) {
                    setThemeState(stored);
                }
                if (storedAccent) {
                    setAccentColorState(storedAccent);
                }

                // Sync with database if user is logged in
                try {
                    const res = await fetch('/api/user/theme');
                    if (res.ok) {
                        const data = await res.json();
                        if (data.theme) setThemeState(data.theme);
                        if (data.accentColor) setAccentColorState(data.accentColor);
                    }
                } catch (error) {
                    // Database sync failed, use localStorage
                    console.log('Using local theme settings');
                }
            } catch (error) {
                console.error('Error loading theme:', error);
            } finally {
                setIsLoaded(true);
            }
        };

        loadTheme();
    }, []);

    // Apply theme to document
    useEffect(() => {
        if (!isLoaded) return;

        const html = document.documentElement;

        // Remove all theme classes
        html.classList.remove('light', 'dark');

        // Apply theme
        if (theme === 'light') {
            html.classList.add('light');
        } else {
            html.classList.add('dark');
        }

        // Store in localStorage
        localStorage.setItem('theme', theme);
        localStorage.setItem('accentColor', accentColor);
    }, [theme, accentColor, isLoaded]);

    const setTheme = async (newTheme: ThemeType) => {
        setThemeState(newTheme);
        try {
            await fetch('/api/user/theme', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme: newTheme }),
            });
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    };

    const setAccentColor = async (color: string) => {
        setAccentColorState(color);
        try {
            await fetch('/api/user/theme', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accentColor: color }),
            });
        } catch (error) {
            console.error('Failed to save accent color:', error);
        }
    };

    if (!isLoaded) {
        return <div className="min-h-screen bg-gray-900">{children}</div>;
    }

    return (
        <ThemeContext.Provider value={{ theme, accentColor, setTheme, setAccentColor }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}
