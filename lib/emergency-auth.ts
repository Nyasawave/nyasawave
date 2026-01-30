// Emergency auth for Vercel when data/users.json isn't accessible
// This is a temporary workaround - in production, use a real database

import bcrypt from 'bcryptjs';

export interface TestUser {
    email: string;
    passwordHash: string;
    roles: string[];
    activePersona: string;
}

// Hash of "test123" with bcrypt
const HASHED_PASSWORD = '$2b$10$/ZqGXaWJ2/aX8L8./Uz9suB7rNA36bQPDIPYjE3SD3MVE3zp3tRQa';

export const EMERGENCY_TEST_USERS: Record<string, TestUser> = {
    'listener@test.com': {
        email: 'listener@test.com',
        passwordHash: HASHED_PASSWORD,
        roles: ['LISTENER'],
        activePersona: 'LISTENER',
    },
    'artist@test.com': {
        email: 'artist@test.com',
        passwordHash: HASHED_PASSWORD,
        roles: ['ARTIST', 'LISTENER'],
        activePersona: 'ARTIST',
    },
    'trapkost2020@gmail.com': {
        email: 'trapkost2020@gmail.com',
        passwordHash: HASHED_PASSWORD,
        roles: ['ADMIN'],
        activePersona: 'ADMIN',
    },
    'admin@test.com': {
        email: 'admin@test.com',
        passwordHash: HASHED_PASSWORD,
        roles: ['ADMIN'],
        activePersona: 'ADMIN',
    },
};

export async function findUserByEmail(email: string): Promise<TestUser | null> {
    return EMERGENCY_TEST_USERS[email] || null;
}

export async function verifyPassword(
    plainPassword: string,
    hashedPassword: string
): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
}
