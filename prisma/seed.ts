import "dotenv/config";
import { prisma } from "../src/config/prisma.js";
import { hashPassword } from "../src/utils/hash.js";

async function main() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
        throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env to seed an admin.");
    }

    const hashed = await hashPassword(password);

    const admin = await prisma.user.upsert({
        where: { email },
        update: { role: "admin" },
        create: {
            email,
            password: hashed,
            role: "admin"
        }
    });

    console.log(`Admin ready: ${admin.email} (role: ${admin.role})`);
}

main()
    .catch((error) => {
        console.error("Seed failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });