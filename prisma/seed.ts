import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient({
    log: ['info'],
});

async function main() {
    const password = await hash('Me@admin04', 12);

    const admin = await prisma.user.upsert({
        where: { email: 'swaroopbr.co@gmail.com' },
        update: {},
        create: {
            email: 'swaroopbr.co@gmail.com',
            username: 'admin',
            password,
            role: 'ADMIN',
            isApproved: true,
        },
    });

    console.log({ admin });
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    });
