#!/usr/bin/env node

const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Test password verification
const testPassword = 'test123';
const hash = '$2b$10$a5nVB/DgIb3DMtaL9t.nTuGfK/XZVfB/QfJJ5L8r7B3OsR7VVONcC';

console.log('\n=== PASSWORD VERIFICATION ===');
console.log(`Test Password: ${testPassword}`);
console.log(`Hash: ${hash}`);

bcrypt.compare(testPassword, hash).then(match => {
    console.log(`Match Result: ${match}`);

    if (match) {
        console.log('\n✓ SUCCESS: Password matches the hash');
    } else {
        console.log('\n✗ FAILURE: Password does NOT match the hash');
    }

    // Now check the users.json file
    console.log('\n=== USERS FILE CHECK ===');
    const usersPath = path.join(process.cwd(), 'data', 'users.json');
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));

    const artistUser = users.find(u => u.email === 'artist@test.com');
    const adminUser = users.find(u => u.email === 'trapkost2020@gmail.com');

    console.log('\nArtist Account (artist@test.com):');
    console.log(`- ID: ${artistUser?.id}`);
    console.log(`- Roles: ${artistUser?.roles?.join(', ')}`);
    console.log(`- Password Hash: ${artistUser?.password}`);
    console.log(`- Hash matches test123: ${artistUser?.password === hash ? 'YES' : 'NO'}`);

    console.log('\nAdmin Account (trapkost2020@gmail.com):');
    console.log(`- ID: ${adminUser?.id}`);
    console.log(`- Roles: ${adminUser?.roles?.join(', ')}`);
    console.log(`- Password Hash: ${adminUser?.password}`);
    console.log(`- Hash matches test123: ${adminUser?.password === hash ? 'YES' : 'NO'}`);

    process.exit(0);
});
