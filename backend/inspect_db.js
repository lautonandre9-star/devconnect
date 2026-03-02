const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const result = await prisma.$queryRawUnsafe('DESCRIBE users');
        console.log('Columns in users table:');
        console.log(result);
    } catch (e) {
        console.error('Error describing table:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
