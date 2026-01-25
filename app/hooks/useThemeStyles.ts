'use client';

import { useTheme } from '@/app/context/ThemeContext';

export function useThemeStyles() {
    const { theme } = useTheme();

    const styles = {
        // Background colors
        bg: {
            primary: theme === 'dark' ? 'bg-gray-900' : 'bg-white',
            secondary: theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100',
            tertiary: theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200',
            hover: theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200',
        },
        // Text colors
        text: {
            primary: theme === 'dark' ? 'text-white' : 'text-black',
            secondary: theme === 'dark' ? 'text-zinc-400' : 'text-gray-600',
            tertiary: theme === 'dark' ? 'text-zinc-500' : 'text-gray-700',
        },
        // Border colors
        border: {
            primary: theme === 'dark' ? 'border-gray-700' : 'border-gray-300',
            secondary: theme === 'dark' ? 'border-gray-800' : 'border-gray-200',
        },
        // Special colors
        accent: 'text-emerald-500',
        danger: 'text-red-500',
        success: 'text-green-500',
    };

    return styles;
}

// Global theme colors for consistency
export const THEME_COLORS = {
    dark: {
        background: '#111827',
        surface: '#1f2937',
        border: '#374151',
        text: '#ffffff',
        textSecondary: '#a1a5ab',
        accent: '#10b981',
    },
    light: {
        background: '#ffffff',
        surface: '#f3f4f6',
        border: '#d1d5db',
        text: '#000000',
        textSecondary: '#6b7280',
        accent: '#059669',
    },
};
