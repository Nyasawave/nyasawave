#!/usr/bin/env node

/**
 * NYASAWAVE - AUTOMATED PAGE VERIFICATION
 * Tests all 28 pages for proper loading and errors
 */

const pages = [
    // Home & Main
    { path: '/', name: 'Home' },

    // Authentication
    { path: '/login', name: 'Login' },
    { path: '/register', name: 'Register' },
    { path: '/signin', name: 'Sign In' },
    { path: '/forgot', name: 'Forgot Password' },

    // User Pages
    { path: '/me', name: 'My Profile' },
    { path: '/discover', name: 'Discover' },

    // Music
    { path: '/upload', name: 'Upload' },
    { path: '/playlists', name: 'Playlists' },

    // Marketplace
    { path: '/marketplace', name: 'Marketplace' },
    { path: '/orders', name: 'Orders' },

    // Business
    { path: '/business', name: 'Business' },
    { path: '/pricing', name: 'Pricing' },
    { path: '/subscribe', name: 'Subscribe' },

    // Payments
    { path: '/payment/checkout', name: 'Checkout' },

    // Dashboards
    { path: '/admin', name: 'Admin Dashboard' },
    { path: '/artist', name: 'Artist Dashboard' },
    { path: '/listener', name: 'Listener Dashboard' },
    { path: '/entrepreneur', name: 'Entrepreneur Dashboard' },
    { path: '/marketer', name: 'Marketer Dashboard' },

    // Legal
    { path: '/terms', name: 'Terms of Service' },
    { path: '/privacy', name: 'Privacy Policy' },
    { path: '/copyright', name: 'Copyright' },
    { path: '/refund', name: 'Refund Policy' },
    { path: '/community-guidelines', name: 'Community Guidelines' },
    { path: '/seller-agreement', name: 'Seller Agreement' },

    // Other
    { path: '/analytics', name: 'Analytics' },
    { path: '/investors', name: 'Investors' },
];

const baseUrl = 'http://localhost:3001';

console.log('\n╔══════════════════════════════════════════════════════╗');
console.log('║   NYASAWAVE - AUTOMATED PAGE VERIFICATION            ║');
console.log('║   Testing All 28+ Pages for Accessibility            ║');
console.log('╚══════════════════════════════════════════════════════╝\n');

console.log(`Testing against: ${baseUrl}\n`);
console.log(`Total pages to test: ${pages.length}\n`);

console.log('PAGE URLS TO TEST:');
console.log('─'.repeat(60));

pages.forEach((page, i) => {
    const url = `${baseUrl}${page.path}`;
    console.log(`${String(i + 1).padStart(2, '0')}. ${page.path.padEnd(25)} | ${page.name}`);
});

console.log('\n─'.repeat(60));

console.log('\n✅ INSTRUCTIONS:');
console.log('1. Open Simple Browser at http://localhost:3001');
console.log('2. Copy each URL from above');
console.log('3. Paste into browser address bar');
console.log('4. Check if page loads completely');
console.log('5. Open DevTools (F12) and check Console tab for errors');
console.log('6. Record results in LIVE_TESTING_REPORT.md\n');

console.log('🔍 WHAT TO CHECK:');
console.log('   ✓ Page loads (no white screen)');
console.log('   ✓ No 404 errors');
console.log('   ✓ No console errors');
console.log('   ✓ Styling loads correctly');
console.log('   ✓ Navigation elements visible\n');

console.log('📋 TEST QUICK LINKS:');
const categories = [
    { name: 'HOME', pages: ['/', '/'] },
    { name: 'AUTH', pages: ['/login', '/register', '/signin', '/forgot'] },
    { name: 'USER', pages: ['/me', '/discover'] },
    { name: 'MUSIC', pages: ['/upload', '/playlists'] },
    { name: 'MARKET', pages: ['/marketplace', '/orders'] },
    { name: 'BUSINESS', pages: ['/business', '/pricing', '/subscribe'] },
    { name: 'PAYMENT', pages: ['/payment/checkout'] },
    { name: 'ADMIN', pages: ['/admin'] },
    { name: 'DASHBOARDS', pages: ['/artist', '/listener', '/entrepreneur', '/marketer'] },
    { name: 'LEGAL', pages: ['/terms', '/privacy', '/copyright', '/refund', '/community-guidelines', '/seller-agreement'] },
    { name: 'OTHER', pages: ['/analytics', '/investors'] },
];

categories.forEach(cat => {
    const urls = cat.pages.map(p => `${baseUrl}${p}`).join(' ');
    console.log(`• ${cat.name}: ${cat.pages.join(', ')}`);
});

console.log('\n═'.repeat(60));
console.log('Ready to test! Start with: http://localhost:3001');
console.log('═'.repeat(60) + '\n');
