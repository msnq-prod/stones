import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ adapter: null }); // Adapter null for simple sqlite logic for now or standard init? 
// Actually standard init `new PrismaClient()` should work if config is right, 
// but in v7 things might be tricky. Let's try standard first.
// If it fails, we fall back. 
// Note: `prisma.config.ts` handles the connection URL, so standard `new PrismaClient()` should read it IF running via `prisma db seed` probably?
// Or we pass datasourceUrl manually to be safe.

// Let's rely on standard env loading.
const db = new PrismaClient();

async function main() {
    console.log('Start seeding ...');

    // Locations
    const iceland = await db.location.create({
        data: {
            name: 'Crystal Caves',
            country: 'Iceland',
            lat: 64.9631,
            lng: -19.0208,
            products: {
                create: [
                    {
                        name: 'Rare Blue Gem',
                        description: 'A stunning blue gemstone found in the deep mines.',
                        price: 1200,
                        image: 'https://placehold.co/400x300/0000ff/ffffff?text=Blue+Gem',
                        category: 'Gemstones'
                    }
                ]
            }
        },
    });

    const egypt = await db.location.create({
        data: {
            name: 'Sahara Outpost',
            country: 'Egypt',
            lat: 26.8206,
            lng: 30.8025,
            products: {
                create: [
                    {
                        name: 'Ancient Artifact',
                        description: 'A mysterious artifact from a lost civilization.',
                        price: 5000,
                        image: 'https://placehold.co/400x300/aa0000/ffffff?text=Artifact',
                        category: 'Artifacts'
                    },
                    {
                        name: 'Golden Statue',
                        description: 'A solid gold statue of a deity.',
                        price: 15000,
                        image: 'https://placehold.co/400x300/ffd700/000000?text=Gold',
                        category: 'Art'
                    }
                ]
            }
        },
    });

    const nepal = await db.location.create({
        data: {
            name: 'Himalayan Peaks',
            country: 'Nepal',
            lat: 28.3949,
            lng: 84.1240,
            products: {
                create: [
                    {
                        name: 'Exotic Spice',
                        description: 'Rare spices harvested from the highest peaks.',
                        price: 200,
                        image: 'https://placehold.co/400x300/ffff00/000000?text=Spice',
                        category: 'Spices'
                    }
                ]
            }
        }
    });

    const japan = await db.location.create({
        data: {
            name: 'Kyoto Village',
            country: 'Japan',
            lat: 35.0116,
            lng: 135.7681,
            products: {
                create: [
                    {
                        name: 'Handcrafted Vase',
                        description: 'Delicate vase made by master potters.',
                        price: 800,
                        image: 'https://placehold.co/400x300/00ff00/000000?text=Vase',
                        category: 'Ceramics'
                    }
                ]
            }
        }
    });

    const brazil = await db.location.create({
        data: {
            name: 'Amazon Rainforest',
            country: 'Brazil',
            lat: -3.4653,
            lng: -62.2159,
            // No separate products created here to save space, but logically could be.
        }
    });

    // User
    await db.user.create({
        data: {
            name: 'Explorer One',
            email: 'explorer@example.com',
        }
    });

    console.log('Seeding finished.');
}

main()
    .then(async () => {
        await db.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await db.$disconnect();
        process.exit(1);
    });
