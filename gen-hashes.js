const bcrypt = require('bcryptjs');

async function generateHashes() {
    const h1 = await bcrypt.hash('password', 10);
    const h2 = await bcrypt.hash('test123', 10);
    console.log('password hash:', h1);
    console.log('test123 hash:', h2);
}

generateHashes();
