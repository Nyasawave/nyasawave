import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CURRENCY = 'MWK';
const INITIAL_BALANCE = 0;

async function main() {
    console.log('🌱 Starting database seed...');

    // Clean existing data (optional - comment out for production)
    // await prisma.user.deleteMany({});

    // 1. Create Admin User
    console.log('👨‍💼 Creating Admin user...');
    const adminPassword = await bcrypt.hash('admin123456', 10);
    const admin = await prisma.user.create({
        data: {
            email: 'admin@nyasawave.com',
            password: adminPassword,
            name: 'Nyasa Admin',
            roles: ['ADMIN'],
            verified: true,
            wallet: {
                create: {
                    balance: 100000,
                    currency: CURRENCY,
                    totalEarned: 500000,
                    totalSpent: 400000,
                },
            },
        },
        include: { wallet: true },
    });
    console.log(`✅ Admin created: ${admin.email}`);

    // 2. Create Test Artists
    console.log('🎤 Creating test Artists...');
    const artists = [];
    for (let i = 1; i <= 3; i++) {
        const artistPassword = await bcrypt.hash(`artist${i}password`, 10);
        const artist = await prisma.user.create({
            data: {
                email: `artist${i}@nyasawave.com`,
                password: artistPassword,
                name: `Artist ${i}`,
                roles: ['ARTIST', 'LISTENER'],
                verified: true,
                artist: {
                    create: {
                        stageName: `Stage Name ${i}`,
                        bio: `Professional musician from Malawi - Genre: Pop`,
                        verified: true,
                        earnings: 50000 * i,
                        totalEarnings: 150000 * i,
                        country: 'Malawi',
                    },
                },
                wallet: {
                    create: {
                        balance: 25000 * i,
                        currency: CURRENCY,
                        totalEarned: 150000 * i,
                        totalSpent: 0,
                    },
                },
                subscription: {
                    create: {
                        tier: 'artist',
                        status: 'active',
                        maxTracks: 50,
                        maxPlaylists: 20,
                    },
                },
            },
            include: { artist: true, wallet: true, subscription: true },
        });
        artists.push(artist);
        console.log(`✅ Artist created: ${artist.email}`);
    }

    // 3. Create Test Listeners
    console.log('👂 Creating test Listeners...');
    const listeners = [];
    for (let i = 1; i <= 5; i++) {
        const listenerPassword = await bcrypt.hash(`listener${i}password`, 10);
        const listener = await prisma.user.create({
            data: {
                email: `listener${i}@nyasawave.com`,
                password: listenerPassword,
                name: `Listener ${i}`,
                roles: ['LISTENER'],
                verified: true,
                listener: {
                    create: {
                        favoriteGenres: ['Pop', 'Hip-Hop', 'Reggae'],
                        listeningTime: 1000 * i,
                        likeCount: 50 * i,
                        playlistCount: 5 * i,
                    },
                },
                wallet: {
                    create: {
                        balance: 10000 * i,
                        currency: CURRENCY,
                        totalSpent: 5000 * i,
                    },
                },
                subscription: {
                    create: {
                        tier: 'premium',
                        status: 'active',
                        maxTracks: null,
                        maxPlaylists: 100,
                    },
                },
            },
            include: { listener: true, wallet: true, subscription: true },
        });
        listeners.push(listener);
        console.log(`✅ Listener created: ${listener.email}`);
    }

    // 4. Create Test Entrepreneurs
    console.log('🏢 Creating test Entrepreneurs...');
    const entrepreneurs = [];
    for (let i = 1; i <= 2; i++) {
        const entrepreneurPassword = await bcrypt.hash(`entrepreneur${i}password`, 10);
        const entrepreneur = await prisma.user.create({
            data: {
                email: `entrepreneur${i}@nyasawave.com`,
                password: entrepreneurPassword,
                name: `Entrepreneur ${i}`,
                roles: ['ENTREPRENEUR', 'LISTENER'],
                verified: true,
                entrepreneur: {
                    create: {
                        businessName: `Business ${i}`,
                        businessType: 'merchandise',
                        verified: true,
                        rating: 4.5,
                        totalSales: 200000 * i,
                    },
                },
                wallet: {
                    create: {
                        balance: 75000 * i,
                        currency: CURRENCY,
                        totalEarned: 300000 * i,
                        totalSpent: 50000 * i,
                    },
                },
                subscription: {
                    create: {
                        tier: 'entrepreneur',
                        status: 'active',
                        maxProducts: 500,
                    },
                },
            },
            include: { entrepreneur: true, wallet: true, subscription: true },
        });
        entrepreneurs.push(entrepreneur);
        console.log(`✅ Entrepreneur created: ${entrepreneur.email}`);
    }

    // 5. Create Test Marketers
    console.log('📣 Creating test Marketers...');
    const marketers = [];
    for (let i = 1; i <= 2; i++) {
        const marketerPassword = await bcrypt.hash(`marketer${i}password`, 10);
        const marketer = await prisma.user.create({
            data: {
                email: `marketer${i}@nyasawave.com`,
                password: marketerPassword,
                name: `Marketer ${i}`,
                roles: ['MARKETER', 'LISTENER'],
                verified: true,
                marketer: {
                    create: {
                        companyName: `Marketing Company ${i}`,
                        specialties: ['social_media', 'influencer', 'content_creation'],
                        campaignsCreated: 15 * i,
                        totalReach: 50000 * i,
                        successRate: 85 + i * 2,
                    },
                },
                wallet: {
                    create: {
                        balance: 50000 * i,
                        currency: CURRENCY,
                        totalEarned: 250000 * i,
                        totalSpent: 100000 * i,
                    },
                },
                subscription: {
                    create: {
                        tier: 'marketer',
                        status: 'active',
                    },
                },
            },
            include: { marketer: true, wallet: true, subscription: true },
        });
        marketers.push(marketer);
        console.log(`✅ Marketer created: ${marketer.email}`);
    }

    // 6. Create Sample Tracks for Artists
    console.log('🎵 Creating sample tracks...');
    const tracks = [];
    for (const artist of artists) {
        for (let i = 1; i <= 3; i++) {
            const track = await prisma.track.create({
                data: {
                    title: `${artist.name}'s Track ${i}`,
                    description: `A great track by ${artist.name}`,
                    audioUrl: `https://example.com/audio/track${i}.mp3`,
                    coverArt: `https://example.com/cover/track${i}.jpg`,
                    duration: 180 + i * 30,
                    genre: 'Pop',
                    plays: 100 * i,
                    likes: 50 * i,
                    isBoosted: i === 1, // First track is boosted
                    isReleased: true,
                    artistId: artist.id,
                },
            });
            tracks.push(track);
        }
    }
    console.log(`✅ Created ${tracks.length} sample tracks`);

    // 7. Create a Tournament
    console.log('🏆 Creating test tournament...');
    const tournament = await prisma.tournament.create({
        data: {
            creatorId: admin.id,
            title: 'Nyasa Pop Challenge 2024',
            description: 'A competition for emerging Pop artists in Malawi',
            rules: 'Submit original tracks, no covers. Best ranked by plays, likes, and downloads.',
            status: 'active',
            genre: 'Pop',
            region: 'Malawi',
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            submissionDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
            prizePool: 100000,
            currency: CURRENCY,
            maxParticipants: 50,
            entryFee: 5000,
            rankingBy: 'plays,likes,downloads',
        },
    });
    console.log(`✅ Tournament created: ${tournament.title}`);

    // 8. Add Artists to Tournament
    console.log('📝 Registering artists for tournament...');
    for (const artist of artists) {
        const participant = await prisma.tournamentParticipant.create({
            data: {
                tournamentId: tournament.id,
                artistId: artist.id,
                status: 'active',
                entryPaid: true,
                currentRank: artists.indexOf(artist) + 1,
                score: 100 - artists.indexOf(artist) * 30,
            },
        });

        // Add submission for each artist
        const track = tracks.find((t) => t.artistId === artist.id);
        if (track) {
            await prisma.tournamentSubmission.create({
                data: {
                    tournamentId: tournament.id,
                    participantId: participant.id,
                    trackId: track.id,
                    status: 'accepted',
                    playsAtSubmission: track.plays,
                    likesAtSubmission: track.likes,
                    downloadsAtSubmission: 10,
                },
            });
        }
    }
    console.log('✅ Artists registered for tournament');

    // 9. Add some votes
    console.log('🗳️ Adding sample votes...');
    for (let i = 0; i < listeners.length && i < 3; i++) {
        for (const participant of (
            await prisma.tournamentParticipant.findMany({
                where: { tournamentId: tournament.id },
                take: 2,
            })
        )) {
            await prisma.vote.create({
                data: {
                    tournamentId: tournament.id,
                    voterId: listeners[i].id,
                    participantId: participant.id,
                    ipAddress: `192.168.1.${i + 1}`,
                    deviceHash: `device_hash_${i}`,
                },
            });
        }
    }
    console.log('✅ Sample votes added');

    // 10. Create Prize Distribution
    console.log('🎁 Setting up prize distribution...');
    await prisma.tournamentPrize.create({
        data: {
            tournamentId: tournament.id,
            placement: 1,
            amount: 50000,
            currency: CURRENCY,
        },
    });
    await prisma.tournamentPrize.create({
        data: {
            tournamentId: tournament.id,
            placement: 2,
            amount: 30000,
            currency: CURRENCY,
        },
    });
    await prisma.tournamentPrize.create({
        data: {
            tournamentId: tournament.id,
            placement: 3,
            amount: 20000,
            currency: CURRENCY,
        },
    });
    console.log('✅ Prize distribution configured');

    // 11. Create a Marketplace Product
    console.log('🛍️ Creating marketplace products...');
    for (const entrepreneur of entrepreneurs) {
        const product = await prisma.product.create({
            data: {
                artistId: entrepreneur.id, // Using entrepreneur's ID temporarily for demo
                name: `${entrepreneur.name}'s Beat Pack`,
                description: 'High-quality beats for your next hit',
                type: 'beat',
                price: 15000,
                currency: CURRENCY,
                imageUrl: 'https://example.com/beat.jpg',
                inventory: 100,
                status: 'active',
            },
        });
        console.log(`✅ Product created: ${product.name}`);
    }

    // 12. Create some transactions
    console.log('💰 Creating sample transactions...');
    for (const user of [...artists, ...listeners, ...entrepreneurs, ...marketers]) {
        await prisma.transaction.create({
            data: {
                userId: user.id,
                type: 'DEPOSIT',
                status: 'COMPLETED',
                amount: 10000,
                currency: CURRENCY,
                description: 'Initial account credit',
                paymentMethod: 'bank_transfer',
                completedAt: new Date(),
            },
        });
    }
    console.log('✅ Sample transactions created');

    // 13. Create some notifications
    console.log('📬 Creating sample notifications...');
    for (const listener of listeners) {
        await prisma.notification.create({
            data: {
                userId: listener.id,
                type: 'tournament',
                title: 'New Tournament Available',
                message: `Check out the ${tournament.title} tournament`,
                relatedId: tournament.id,
            },
        });
    }
    console.log('✅ Sample notifications created');

    console.log('\n✨ Database seed completed successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('   ADMIN:        admin@nyasawave.com / admin123456');
    console.log('   ARTIST:       artist1@nyasawave.com / artist1password');
    console.log('   LISTENER:     listener1@nyasawave.com / listener1password');
    console.log('   ENTREPRENEUR: entrepreneur1@nyasawave.com / entrepreneur1password');
    console.log('   MARKETER:     marketer1@nyasawave.com / marketer1password');
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
