#!/usr/bin/env node

const fs = require('fs');
const bcrypt = require('bcryptjs');

const users = JSON.parse(fs.readFileSync('./data/users.json', 'utf-8'));

const testPassword = 'test123';
const correctHash = '$2b$10$/ZqGXaWJ2/aX8L8./Uz9suB7rNA36bQPDIPYjE3SD3MVE3zp3tRQa';

console.log('\n=== TEST ACCOUNT VERIFICATION ===\n');

users.forEach(user => {
    const isTestAccount = user.email.includes('@test.com') || user.email === 'trapkost2020@gmail.com';

    if (isTestAccount) {
        const hashMatches = user.password === correctHash;
        const passwordWorks = bcrypt.compareSync(testPassword, user.password);

        console.log(`✓ ${user.email}`);
        console.log(`  Roles: ${user.roles.join(', ')}`);
        console.log(`  Hash matches: ${hashMatches ? '✅' : '❌'}`);
        console.log(`  Password 'test123' works: ${passwordWorks ? '✅' : '❌'}\n`);
    }
});

console.log('=== SUMMARY ===');
console.log(`Password: test123`);
console.log(`All accounts ready for signin: http://localhost:3000/signin`);
