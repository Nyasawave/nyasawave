/**
 * Reset and Test Script for NyasaWave Platform
 * Clears all test accounts and resets database for fresh testing
 * Usage: npx ts-node scripts/reset-accounts.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDatabase() {
    console.log('🔄 Starting database reset...\n');

    try {
        // Delete all records in order of dependencies
        console.log('📋 Clearing audit logs...');
        await prisma.auditLog.deleteMany({});

        console.log('📋 Clearing withdrawals...');
        await prisma.withdrawal.deleteMany({});

        console.log('📋 Clearing payments...');
        await prisma.payment.deleteMany({});

        console.log('📋 Clearing marketplace ads...');
        await prisma.marketplaceAd.deleteMany({});

        console.log('📋 Clearing track boosts...');
        await prisma.trackBoost.deleteMany({});

        console.log('📋 Clearing tracks...');
        await prisma.track.deleteMany({});

        console.log('📋 Clearing artists...');
        await prisma.artist.deleteMany({});

        console.log('📋 Clearing users...');
        await prisma.user.deleteMany({});

        console.log('\n✅ Database reset complete!\n');
    } catch (error) {
        console.error('❌ Error during reset:', error);
        throw error;
    }
}

async function createTestAccounts() {
    console.log('👤 Creating test accounts...\n');

    const testAccounts = [
        {
            email: 'admin@test.com',
            name: 'Admin User',
            password: 'AdminTest123!',
            role: 'ADMIN',
        },
        {
            email: 'artist1@test.com',
            name: 'Test Artist One',
            password: 'ArtistTest123!',
            role: 'ARTIST',
        },
        {
            email: 'artist2@test.com',
            name: 'Test Artist Two',
            password: 'ArtistTest123!',
            role: 'ARTIST',
        },
        {
            email: 'user1@test.com',
            name: 'Test User One',
            password: 'UserTest123!',
            role: 'USER',
        },
        {
            email: 'user2@test.com',
            name: 'Test User Two',
            password: 'UserTest123!',
            role: 'USER',
        },
        {
            email: 'listener@test.com',
            name: 'Test Listener',
            password: 'ListenerTest123!',
            role: 'USER',
        },
    ];

    for (const account of testAccounts) {
        try {
            const user = await prisma.user.create({
                data: {
                    email: account.email,
                    name: account.name,
                    password: account.password, // In production, this should be hashed
                    role: account.role as any,
                    verified: true,
                },
            });

            console.log(`✅ Created ${account.role}: ${account.email}`);

            // Create artist profile if role is ARTIST
            if (account.role === 'ARTIST') {
                await prisma.artist.create({
                    data: {
                        userId: user.id,
                        stageName: account.name.replace('Test ', ''),
                        bio: `Bio for ${account.name}`,
                        verified: true,
                        country: 'Malawi',
                    },
                });
                console.log(`   └─ Created artist profile for ${account.name}`);
            }
        } catch (error) {
            console.error(`❌ Error creating account ${account.email}:`, error);
        }
    }

    console.log('\n');
}

async function createSampleTracks() {
    console.log('🎵 Creating sample tracks...\n');

    const artists = await prisma.artist.findMany();

    if (artists.length === 0) {
        console.log('⚠️  No artists found. Skipping track creation.\n');
        return;
    }

    const genres = ['Hip-Hop', 'Afrobeats', 'Pop', 'R&B', 'Jazz', 'Electronic'];
    let trackCount = 0;

    for (const artist of artists) {
        for (let i = 1; i <= 3; i++) {
            const genre = genres[Math.floor(Math.random() * genres.length)];

            try {
                await prisma.track.create({
                    data: {
                        title: `${artist.stageName} - Track ${i}`,
                        description: `A sample track by ${artist.stageName}`,
                        audioUrl: `https://example.com/audio/track-${trackCount + i}.mp3`,
                        coverArt: `https://example.com/covers/cover-${trackCount + i}.jpg`,
                        duration: Math.floor(Math.random() * 180) + 120, // 2-5 minutes
                        genre,
                        plays: Math.floor(Math.random() * 1000),
                        likes: Math.floor(Math.random() * 100),
                        artistId: artist.id,
                    },
                });

                trackCount++;
                console.log(`✅ Created track: ${artist.stageName} - Track ${i}`);
            } catch (error) {
                console.error(`❌ Error creating track for ${artist.stageName}:`, error);
            }
        }
    }

    console.log(`\n✅ Created ${trackCount} sample tracks!\n`);
}

async function main() {
    try {
        console.log('\n════════════════════════════════════════════════════════════════');
        console.log('         🎵 NYASAWAVE DATABASE RESET & TEST SETUP 🎵');
        console.log('════════════════════════════════════════════════════════════════\n');

        await resetDatabase();
        await createTestAccounts();
        await createSampleTracks();

        console.log('════════════════════════════════════════════════════════════════');
        console.log('✅ DATABASE SETUP COMPLETE!\n');
        console.log('📝 TEST ACCOUNT CREDENTIALS:\n');
        console.log('Admin Account:');
        console.log('  Email: admin@test.com');
        console.log('  Password: AdminTest123!\n');

        console.log('Artist Accounts:');
        console.log('  Email: artist1@test.com | Password: ArtistTest123!');
        console.log('  Email: artist2@test.com | Password: ArtistTest123!\n');

        console.log('Regular User Accounts:');
        console.log('  Email: user1@test.com | Password: UserTest123!');
        console.log('  Email: user2@test.com | Password: UserTest123!');
        console.log('  Email: listener@test.com | Password: ListenerTest123!\n');

        console.log('════════════════════════════════════════════════════════════════\n');
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
