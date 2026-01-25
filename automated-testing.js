#!/usr/bin/env node

/**
 * NYASAWAVE - COMPREHENSIVE AUTOMATED TESTING SCRIPT
 * Tests all 29 pages, features, and API endpoints
 * Generates detailed test report with results
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TIMEOUT = 10000;
const PAGES_TO_TEST = [
    // HOME & MAIN
    { path: '/', name: 'Home Page', category: 'HOME & MAIN' },

    // AUTHENTICATION
    { path: '/login', name: 'Login', category: 'AUTHENTICATION' },
    { path: '/register', name: 'Register', category: 'AUTHENTICATION' },
    { path: '/signin', name: 'Sign In', category: 'AUTHENTICATION' },
    { path: '/forgot', name: 'Forgot Password', category: 'AUTHENTICATION' },

    // USER PAGES
    { path: '/me', name: 'My Profile', category: 'USER PAGES' },
    { path: '/discover', name: 'Discover', category: 'USER PAGES' },

    // MUSIC
    { path: '/upload', name: 'Upload Music', category: 'MUSIC' },
    { path: '/playlists', name: 'Playlists', category: 'MUSIC' },

    // MARKETPLACE
    { path: '/marketplace', name: 'Marketplace', category: 'MARKETPLACE' },
    { path: '/orders', name: 'Orders', category: 'MARKETPLACE' },

    // BUSINESS
    { path: '/business', name: 'Business', category: 'BUSINESS' },
    { path: '/pricing', name: 'Pricing', category: 'BUSINESS' },
    { path: '/subscribe', name: 'Subscribe', category: 'BUSINESS' },

    // PAYMENTS
    { path: '/payment/checkout', name: 'Checkout', category: 'PAYMENTS' },

    // ADMIN & DASHBOARDS
    { path: '/admin', name: 'Admin Dashboard', category: 'DASHBOARDS' },
    { path: '/artist', name: 'Artist Dashboard', category: 'DASHBOARDS' },
    { path: '/listener', name: 'Listener Dashboard', category: 'DASHBOARDS' },
    { path: '/entrepreneur', name: 'Entrepreneur Dashboard', category: 'DASHBOARDS' },
    { path: '/marketer', name: 'Marketer Dashboard', category: 'DASHBOARDS' },

    // LEGAL
    { path: '/terms', name: 'Terms of Service', category: 'LEGAL' },
    { path: '/privacy', name: 'Privacy Policy', category: 'LEGAL' },
    { path: '/copyright', name: 'Copyright', category: 'LEGAL' },
    { path: '/refund', name: 'Refund Policy', category: 'LEGAL' },
    { path: '/community-guidelines', name: 'Community Guidelines', category: 'LEGAL' },
    { path: '/seller-agreement', name: 'Seller Agreement', category: 'LEGAL' },

    // OTHER
    { path: '/analytics', name: 'Analytics', category: 'OTHER' },
    { path: '/investors', name: 'Investors', category: 'OTHER' },
];

// API endpoints to test
const API_ENDPOINTS = [
    { path: '/api/auth/providers', method: 'GET', name: 'Auth Providers' },
    { path: '/api/auth/session', method: 'GET', name: 'Auth Session' },
    { path: '/api/users', method: 'GET', name: 'Users List' },
    { path: '/api/artists', method: 'GET', name: 'Artists List' },
    { path: '/api/songs', method: 'GET', name: 'Songs List' },
    { path: '/api/playlists', method: 'GET', name: 'Playlists' },
    { path: '/api/marketplace/products', method: 'GET', name: 'Marketplace Products' },
    { path: '/api/marketplace/orders', method: 'GET', name: 'Marketplace Orders' },
    { path: '/api/tournaments', method: 'GET', name: 'Tournaments' },
    { path: '/api/payments/balance', method: 'GET', name: 'Payment Balance' },
];

// Test results storage
const results = {
    timestamp: new Date().toISOString(),
    serverStatus: 'CHECKING',
    totalPages: PAGES_TO_TEST.length,
    totalAPIs: API_ENDPOINTS.length,
    pages: {
        passed: 0,
        failed: 0,
        results: []
    },
    apis: {
        passed: 0,
        failed: 0,
        results: []
    },
    errors: []
};

// Utility functions
function makeRequest(urlPath, method = 'GET') {
    return new Promise((resolve) => {
        const url = new URL(urlPath, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            timeout: TIMEOUT,
            headers: {
                'User-Agent': 'NyasaWave-Test-Bot/1.0',
            }
        };

        const startTime = Date.now();
        const request = http.request(options, (response) => {
            let data = '';

            response.on('data', chunk => {
                data += chunk;
            });

            response.on('end', () => {
                const loadTime = Date.now() - startTime;
                const statusCode = response.statusCode;
                const contentType = response.headers['content-type'] || 'unknown';

                resolve({
                    success: statusCode >= 200 && statusCode < 400,
                    statusCode: statusCode,
                    loadTime: loadTime,
                    contentType: contentType,
                    hasContent: data.length > 0,
                    contentLength: data.length
                });
            });
        });

        request.on('error', (error) => {
            resolve({
                success: false,
                error: error.message,
                statusCode: 0,
                loadTime: Date.now() - startTime
            });
        });

        request.on('timeout', () => {
            request.destroy();
            resolve({
                success: false,
                error: 'Request timeout',
                statusCode: 0,
                loadTime: TIMEOUT
            });
        });

        request.end();
    });
}

async function checkServerStatus() {
    console.log('\n🔍 Checking server status...');
    const result = await makeRequest('/');
    return result.success;
}

async function testPages() {
    console.log(`\n📄 Testing ${PAGES_TO_TEST.length} pages...\n`);

    const categoryMap = {};

    for (const page of PAGES_TO_TEST) {
        process.stdout.write(`  Testing ${page.path}... `);
        const result = await makeRequest(page.path);

        const pageResult = {
            path: page.path,
            name: page.name,
            category: page.category,
            ...result
        };

        results.pages.results.push(pageResult);

        if (!categoryMap[page.category]) {
            categoryMap[page.category] = { passed: 0, failed: 0 };
        }

        if (result.success) {
            results.pages.passed++;
            categoryMap[page.category].passed++;
            console.log(`✅ ${result.statusCode} (${result.loadTime}ms)`);
        } else {
            results.pages.failed++;
            categoryMap[page.category].failed++;
            const error = result.error || `Status ${result.statusCode}`;
            console.log(`❌ ${error}`);
            results.errors.push({
                page: page.path,
                error: error
            });
        }
    }

    return categoryMap;
}

async function testAPIs() {
    console.log(`\n🔌 Testing ${API_ENDPOINTS.length} API endpoints...\n`);

    for (const endpoint of API_ENDPOINTS) {
        process.stdout.write(`  Testing ${endpoint.path}... `);
        const result = await makeRequest(endpoint.path, endpoint.method);

        const apiResult = {
            path: endpoint.path,
            name: endpoint.name,
            method: endpoint.method,
            ...result
        };

        results.apis.results.push(apiResult);

        if (result.success) {
            results.apis.passed++;
            console.log(`✅ ${result.statusCode} (${result.loadTime}ms)`);
        } else {
            results.apis.failed++;
            const error = result.error || `Status ${result.statusCode}`;
            console.log(`❌ ${error}`);
            results.errors.push({
                endpoint: endpoint.path,
                error: error
            });
        }
    }
}

function generateReport(categoryMap) {
    const timestamp = new Date().toLocaleString();
    let report = `# NYASAWAVE - AUTOMATED TEST REPORT\n\n`;
    report += `**Generated**: ${timestamp}\n`;
    report += `**Server Status**: ${results.serverStatus}\n\n`;

    // Summary
    report += `## 📊 SUMMARY\n\n`;
    report += `| Metric | Passed | Failed | Total | Pass Rate |\n`;
    report += `|--------|--------|--------|-------|----------|\n`;

    const pagePassRate = results.totalPages > 0
        ? ((results.pages.passed / results.totalPages) * 100).toFixed(1)
        : 0;
    const apiPassRate = results.totalAPIs > 0
        ? ((results.apis.passed / results.totalAPIs) * 100).toFixed(1)
        : 0;

    report += `| Pages | ${results.pages.passed} | ${results.pages.failed} | ${results.totalPages} | ${pagePassRate}% |\n`;
    report += `| APIs | ${results.apis.passed} | ${results.apis.failed} | ${results.totalAPIs} | ${apiPassRate}% |\n\n`;

    // Category breakdown
    report += `## 📂 PAGE CATEGORIES\n\n`;
    for (const [category, stats] of Object.entries(categoryMap)) {
        const total = stats.passed + stats.failed;
        const rate = total > 0 ? ((stats.passed / total) * 100).toFixed(0) : 0;
        report += `- **${category}**: ${stats.passed}/${total} passed (${rate}%)\n`;
    }

    report += `\n## ✅ PASSED PAGES\n\n`;
    results.pages.results.filter(p => p.success).forEach(p => {
        report += `- ✅ \`${p.path}\` - ${p.name} (${p.loadTime}ms)\n`;
    });

    report += `\n## ❌ FAILED PAGES\n\n`;
    const failedPages = results.pages.results.filter(p => !p.success);
    if (failedPages.length === 0) {
        report += `All pages passed! 🎉\n`;
    } else {
        failedPages.forEach(p => {
            report += `- ❌ \`${p.path}\` - ${p.name}\n`;
            report += `  - Error: ${p.error || 'Status ' + p.statusCode}\n`;
        });
    }

    report += `\n## 🔌 API ENDPOINTS\n\n`;
    report += `### ✅ PASSED APIs\n\n`;
    results.apis.results.filter(a => a.success).forEach(a => {
        report += `- ✅ \`${a.method} ${a.path}\` - ${a.name} (${a.loadTime}ms)\n`;
    });

    report += `\n### ❌ FAILED APIs\n\n`;
    const failedAPIs = results.apis.results.filter(a => !a.success);
    if (failedAPIs.length === 0) {
        report += `All APIs responded! 🎉\n`;
    } else {
        failedAPIs.forEach(a => {
            report += `- ❌ \`${a.method} ${a.path}\` - ${a.name}\n`;
            report += `  - Error: ${a.error || 'Status ' + a.statusCode}\n`;
        });
    }

    report += `\n## 🐛 ALL ERRORS\n\n`;
    if (results.errors.length === 0) {
        report += `No errors found! ✨\n`;
    } else {
        results.errors.forEach((err, i) => {
            report += `${i + 1}. ${err.page || err.endpoint}\n`;
            report += `   - ${err.error}\n\n`;
        });
    }

    report += `\n---\n`;
    report += `**Test Duration**: Complete\n`;
    report += `**Platform**: NyasaWave v16.1.1\n`;
    report += `**Next.js**: Turbopack\n`;

    return report;
}

async function main() {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║      NYASAWAVE - COMPREHENSIVE AUTOMATED TEST SUITE        ║');
    console.log('║                                                            ║');
    console.log('║  Testing all 29 pages + 10+ API endpoints                 ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Check server
    const serverUp = await checkServerStatus();
    results.serverStatus = serverUp ? '✅ ONLINE' : '❌ OFFLINE';

    if (!serverUp) {
        console.log('\n❌ Server is not responding. Make sure dev server is running on port 3000.');
        console.log('   Run: pnpm run dev');
        process.exit(1);
    }

    // Run tests
    const categoryMap = await testPages();
    await testAPIs();

    // Generate report
    const report = generateReport(categoryMap);

    // Save report
    const reportPath = path.join(__dirname, 'TEST_RESULTS.md');
    fs.writeFileSync(reportPath, report);

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    TEST RESULTS SUMMARY                    ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log(`✅ Pages Passed: ${results.pages.passed}/${results.totalPages}`);
    console.log(`❌ Pages Failed: ${results.pages.failed}/${results.totalPages}`);
    console.log(`✅ APIs Passed: ${results.apis.passed}/${results.totalAPIs}`);
    console.log(`❌ APIs Failed: ${results.apis.failed}/${results.totalAPIs}`);
    console.log(`\n📝 Full report saved to: ${reportPath}\n`);

    process.exit(results.pages.failed > 0 || results.apis.failed > 0 ? 1 : 0);
}

main().catch(console.error);
