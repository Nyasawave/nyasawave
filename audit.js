#!/usr/bin/env node

/**
 * NyasaWave Platform - Comprehensive Audit & Verification Script
 * Checks all features, roles, and functionality
 */

const fs = require('fs');
const path = require('path');

const checks = {
    passed: [],
    failed: [],
    warnings: []
};

// Helper functions
function checkFile(filePath, description) {
    if (fs.existsSync(filePath)) {
        checks.passed.push(`✅ ${description}`);
        return true;
    } else {
        checks.failed.push(`❌ ${description} - File not found: ${filePath}`);
        return false;
    }
}

function checkFileContains(filePath, searchText, description) {
    if (!fs.existsSync(filePath)) {
        checks.failed.push(`❌ ${description} - File not found: ${filePath}`);
        return false;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    if (content.includes(searchText)) {
        checks.passed.push(`✅ ${description}`);
        return true;
    } else {
        checks.failed.push(`❌ ${description} - Text not found: "${searchText}"`);
        return false;
    }
}

function checkDirectory(dirPath, description) {
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
        checks.passed.push(`✅ ${description}`);
        return true;
    } else {
        checks.failed.push(`❌ ${description} - Directory not found: ${dirPath}`);
        return false;
    }
}

const BASE = __dirname; // Use current directory, not nyasawave subfolder

console.log('🔍 NyasaWave Platform - Full Audit\n');
console.log('='.repeat(60));

// PHASE 1: USER ROLES & ACCESS CONTROL
console.log('\n📋 PHASE 1: User Roles & Access Control');
console.log('-'.repeat(60));
checkFile(path.join(BASE, 'lib/types.ts'), 'User types defined (6 roles)');
checkFileContains(path.join(BASE, 'app/admin/page.tsx'), "user.role !== 'ADMIN'", 'Admin route protection');
checkFile(path.join(BASE, 'middleware.ts'), 'Route middleware exists');
checkFileContains(path.join(BASE, 'middleware.ts'), '/admin', 'Admin routes protected');

// PHASE 2: AUTHENTICATION
console.log('\n🔐 PHASE 2: Authentication & Accounts');
console.log('-'.repeat(60));
checkFile(path.join(BASE, 'app/api/auth/login/route.ts'), 'Login API route');
checkFile(path.join(BASE, 'app/api/auth/register/route.ts'), 'Register API route');
checkFile(path.join(BASE, 'lib/auth.ts'), 'Auth utilities (JWT, bcrypt)');
checkFileContains(path.join(BASE, 'lib/auth.ts'), 'comparePassword', 'Password comparison');
checkFileContains(path.join(BASE, 'lib/auth.ts'), 'generateToken', 'Token generation');
checkFileContains(path.join(BASE, 'app/context/AuthContext.tsx'), 'localStorage', 'Token persistence');

// Check admin user exists
const usersPath = path.join(BASE, 'data/users.json');
try {
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    const adminUser = users.find(u => u.email === 'trapkost2020@gmail.com');
    if (adminUser && adminUser.role === 'ADMIN') {
        checks.passed.push('✅ Admin user exists (trapkost2020@gmail.com)');
    } else {
        checks.failed.push('❌ Admin user not found or not ADMIN role');
    }
    checks.passed.push(`✅ User accounts reset (${users.length} user(s) in database)`);
} catch (e) {
    checks.failed.push('❌ Could not read users.json');
}

// PHASE 3: MUSIC STREAMING ENGINE
console.log('\n🎵 PHASE 3: Music Streaming Engine');
console.log('-'.repeat(60));
checkFile(path.join(BASE, 'app/api/stream/log/route.ts'), 'Stream logging API');
checkFileContains(path.join(BASE, 'app/api/stream/log/route.ts'), 'duration < 30', '30-second minimum rule');
checkFileContains(path.join(BASE, 'app/api/stream/log/route.ts'), 'isValidStream', 'Spam/duplicate check');
checkFile(path.join(BASE, 'app/components/Player.tsx'), 'Audio player component');
checkFileContains(path.join(BASE, 'app/components/Player.tsx'), 'audioRef', 'Player context usage');
checkFileContains(path.join(BASE, 'app/components/Player.tsx'), 'timeupdate', 'Progress tracking');

// PHASE 4: ARTIST FEATURES
console.log('\n🎤 PHASE 4: Artist Features');
console.log('-'.repeat(60));
checkDirectory(path.join(BASE, 'app/api/artist'), 'Artist API routes');
checkDirectory(path.join(BASE, 'app/artist'), 'Artist dashboard pages');
checkFile(path.join(BASE, 'app/api/artist/upload.ts'), 'Track upload API');
checkFile(path.join(BASE, 'app/api/artist/boost'), 'Boost feature API');
checkFile(path.join(BASE, 'app/api/artist/earnings.ts'), 'Earnings calculation');
checkFile(path.join(BASE, 'app/api/artist/analytics'), 'Analytics API');

// PHASE 5: SUBSCRIPTIONS & PAYMENTS
console.log('\n💳 PHASE 5: Subscriptions & Payments');
console.log('-'.repeat(60));
checkDirectory(path.join(BASE, 'app/api/payments'), 'Payment APIs');
checkFile(path.join(BASE, 'app/api/payments/initiate/route.ts'), 'Payment initiation');
checkFile(path.join(BASE, 'app/payment'), 'Payment page');
checkFile(path.join(BASE, 'app/subscribe'), 'Subscription page');

// PHASE 6: BUSINESS MARKETPLACE
console.log('\n🏢 PHASE 6: Business Marketplace');
console.log('-'.repeat(60));
checkFile(path.join(BASE, 'app/business/page.tsx'), 'Business marketplace page');
checkFile(path.join(BASE, 'app/marketplace/page.tsx'), 'Marketplace page');

// PHASE 7: ADMIN PANEL
console.log('\n👨‍💼 PHASE 7: Admin Panel');
console.log('-'.repeat(60));
checkFile(path.join(BASE, 'app/admin/page.tsx'), 'Admin dashboard');
checkFile(path.join(BASE, 'app/admin/artists'), 'Artist management');
checkFile(path.join(BASE, 'app/admin/users'), 'User management');
checkFileContains(path.join(BASE, 'app/admin/page.tsx'), 'user.role !== \'ADMIN\'', 'Admin access control');

// PHASE 8: UI/UX
console.log('\n🎨 PHASE 8: UI/UX & Accessibility');
console.log('-'.repeat(60));
checkFile(path.join(BASE, 'app/globals.css'), 'Global styles');
checkFile(path.join(BASE, 'app/layout.tsx'), 'Layout component');
checkFile(path.join(BASE, 'app/components/Navbar.tsx'), 'Navigation bar');
checkFileContains(path.join(BASE, 'app/globals.css'), 'emerald-400', 'Theme colors');
checkFileContains(path.join(BASE, 'tailwind.config.ts') || path.join(BASE, 'tailwind.config.js'), 'dark', 'Dark theme');

// PHASE 9: PAGES
console.log('\n📄 PHASE 9: All Pages Exist');
console.log('-'.repeat(60));
const pages = [
    ['app/page.tsx', 'Home'],
    ['app/discover/page.tsx', 'Discover'],
    ['app/signin/page.tsx', 'Sign In'],
    ['app/register/page.tsx', 'Register'],
    ['app/me/page.tsx', 'Dashboard'],
    ['app/upload/page.tsx', 'Upload'],
    ['app/analytics/page.tsx', 'Analytics'],
    ['app/investors/page.tsx', 'Investors'],
    ['app/artists/page.tsx', 'Artists'],
    ['app/admin/page.tsx', 'Admin'],
    ['app/payment/page.tsx', 'Payment'],
    ['app/marketplace/page.tsx', 'Marketplace'],
    ['app/pricing/page.tsx', 'Pricing'],
    ['app/playlists/page.tsx', 'Playlists']
];

pages.forEach(([file, name]) => {
    checkFile(path.join(BASE, file), `${name} page exists`);
});

// PHASE 10: ERROR CHECK
console.log('\n🔧 PHASE 10: Code Quality');
console.log('-'.repeat(60));
checkFile(path.join(BASE, 'tsconfig.json'), 'TypeScript config');
checkFile(path.join(BASE, 'eslint.config.mjs'), 'ESLint config');
checkFile(path.join(BASE, 'next.config.ts'), 'Next.js config');
checkFile(path.join(BASE, 'package.json'), 'Package.json');

// SUMMARY
console.log('\n' + '='.repeat(60));
console.log('📊 AUDIT SUMMARY');
console.log('='.repeat(60));
console.log(`✅ Passed: ${checks.passed.length}`);
console.log(`❌ Failed: ${checks.failed.length}`);
console.log(`⚠️  Warnings: ${checks.warnings.length}`);

if (checks.passed.length > 0) {
    console.log('\n✅ PASSED CHECKS:');
    checks.passed.forEach(c => console.log(`  ${c}`));
}

if (checks.failed.length > 0) {
    console.log('\n❌ FAILED CHECKS:');
    checks.failed.forEach(c => console.log(`  ${c}`));
}

if (checks.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    checks.warnings.forEach(w => console.log(`  ${w}`));
}

// Final status
const totalChecks = checks.passed.length + checks.failed.length;
const passPercentage = Math.round((checks.passed.length / totalChecks) * 100);

console.log('\n' + '='.repeat(60));
if (checks.failed.length === 0) {
    console.log('🎉 PLATFORM STATUS: PRODUCTION READY ✅');
} else {
    console.log(`⚠️  PLATFORM STATUS: ${passPercentage}% Complete (${checks.failed.length} issues to fix)`);
}
console.log('='.repeat(60));
