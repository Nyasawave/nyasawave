/**
 * Shared types across the NyasaWave application
 */

// User Types
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'USER' | 'ARTIST' | 'BUSINESS' | 'ADMIN';
    banned?: boolean;
    createdAt: string;
    [key: string]: unknown;
}

// Artist Types
export interface Artist {
    id: string;
    name: string;
    email: string;
    verified: boolean;
    bio?: string;
    profileImage?: string;
    [key: string]: unknown;
}

// Track Types
export interface Track {
    id: string;
    title: string;
    artist: string;
    artistId: string;
    src: string;
    streamUrl?: string;
    cover?: string;
    genre: string;
    duration: number;
    plays: number;
    likes: number;
    description?: string;
    [key: string]: unknown;
}

// Marketplace Types
export interface MarketplaceProduct {
    id: string;
    name: string;
    price: number;
    currency: string;
    sold: number;
    image?: string;
    [key: string]: unknown;
}

// Business Types
export interface Business {
    id: string;
    name: string;
    email: string;
    verified: boolean;
    [key: string]: unknown;
}

// Admin Types
export interface AdminUser extends User {
    role: 'ADMIN';
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    [key: string]: unknown;
}

export interface PaginationInfo {
    total: number;
    pages: number;
    limit: number;
    currentPage?: number;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: PaginationInfo;
    error?: string;
}

// Financial Types
export interface WithdrawalData {
    id: string;
    artistId: string;
    amount: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    bankDetails?: {
        accountName?: string;
        accountNumber?: string;
        bankName?: string;
    };
    requestedAt: string;
    processedAt?: string;
    [key: string]: unknown;
}

export interface EarningsData {
    totalEarnings: number;
    totalStreams: number;
    estimatedMonthlyEarnings: number;
    recentTransactions?: Transaction[];
    [key: string]: unknown;
}

export interface Transaction {
    id: string;
    type: 'STREAM' | 'WITHDRAWAL' | 'REFUND';
    amount: number;
    date: string;
    [key: string]: unknown;
}
