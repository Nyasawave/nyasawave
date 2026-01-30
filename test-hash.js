#!/usr/bin/env node

const bcrypt = require('bcryptjs');

const password = 'test123';
const hash = '$2b$10$/ZqGXaWJ2/aX8L8./Uz9suB7rNA36bQPDIPYjE3SD3MVE3zp3tRQa';

bcrypt.compare(password, hash).then(result => {
    console.log(`Password: ${password}`);
    console.log(`Hash: ${hash}`);
    console.log(`Match: ${result}`);

    if (!result) {
        // Generate a new hash to be sure
        const newHash = bcrypt.hashSync(password, 10);
        console.log(`\nNew generated hash: ${newHash}`);
    }
});
