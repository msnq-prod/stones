
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const languages = [
        { id: 1, name: 'English', available: true },
        { id: 2, name: 'Russian', available: true },
        { id: 3, name: 'German', available: false },
        { id: 4, name: 'Chinese', available: false },
        { id: 5, name: 'French', available: false },
    ];

    console.log('Seeding languages...');

    for (const lang of languages) {
        await prisma.language.upsert({
            where: { id: lang.id },
            update: { name: lang.name, available: lang.available },
            create: { id: lang.id, name: lang.name, available: lang.available },
        });
    }

    console.log('Languages seeded successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
