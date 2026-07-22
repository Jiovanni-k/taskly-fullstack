import { beforeEach, describe, expect, it, vi } from "vitest";
import * as service from "../../services/user.service.js";
import { hashPassword } from "../../utils/hash.js";
import { prisma } from "../../config/prisma.js";
// Only tests the methods in the service layer.

vi.mock("../../config/prisma.js", () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
            findMany: vi.fn()
        }
    }
}));

describe("User Service testing", () => {
    const userId = "11111111-1111-4111-8111-111111111111";
    const email = "test@gmail.com";
    const password = "password123";

    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe("register", () => {
        it("should throw error when email is missing", async () => {
            await expect(service.register("", password)).rejects.toThrow(
                "Email and Password are required."
            );
        });

        it("should throw error when password is missing", async () => {
            await expect(service.register(email, "")).rejects.toThrow(
                "Email and Password are required."
            );
        });

        it("should throw error when email already exists", async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValue({
                id: userId,
                email,
                password: "hashed",
                role: "user"
            });

            await expect(service.register(email, password)).rejects.toThrow(
                "Email already exists."
            );
        });

        it("should register a new user", async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
            vi.mocked(prisma.user.create).mockResolvedValue({
                id: userId,
                email,
                password: "hashed",
                role: "user"
            });

            const result = await service.register(email, password);
            expect(result.email).toBe(email);
            expect(result.id).toBe(userId);
        });
    });

    describe("login", () => {
        it("should throw error when email is missing", async () => {
            await expect(service.login("", password)).rejects.toThrow(
                "Email and Password are required."
            );
        });

        it("should throw error when user does not exist", async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

            await expect(service.login(email, password)).rejects.toThrow(
                "Invalid email or password."
            );
        });

        it("should throw error when password is incorrect", async () => {
            const hashed = await hashPassword(password);
            vi.mocked(prisma.user.findUnique).mockResolvedValue({
                id: userId,
                email,
                password: hashed,
                role: "user"
            });

            await expect(service.login(email, "wrong-password")).rejects.toThrow(
                "Invalid email or password."
            );
        });

        it("should return a token and the user on success", async () => {
            const hashed = await hashPassword(password);
            vi.mocked(prisma.user.findUnique).mockResolvedValue({
                id: userId,
                email,
                password: hashed,
                role: "user"
            });

            const result = await service.login(email, password);
            expect(result).toHaveProperty("token");
            expect(typeof result.token).toBe("string");
            expect(result.user).toEqual({
                id: userId,
                email,
                role: "user"
            });
        });
    });

    describe("listUsers", () => {
        it("should return all users without passwords", async () => {
            vi.mocked(prisma.user.findMany).mockResolvedValue([
                {
                    id: userId,
                    email,
                    role: "user"
                },
                {
                    id: "22222222-2222-4222-8222-222222222222",
                    email: "admin@gmail.com",
                    role: "admin"
                }
            ] as Awaited<ReturnType<typeof prisma.user.findMany>>);

            const result = await service.listUsers();

            expect(prisma.user.findMany).toHaveBeenCalled();
            expect(result).toEqual([
                {
                    id: userId,
                    email,
                    role: "user"
                },
                {
                    id: "22222222-2222-4222-8222-222222222222",
                    email: "admin@gmail.com",
                    role: "admin"
                }
            ]);
            expect(result[0]).not.toHaveProperty("password");
        });
    });
});
