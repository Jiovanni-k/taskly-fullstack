import { describe, expect, it, vi } from "vitest";
import * as service from "../../services/user.service.js";
import * as repository from "../../repositories/user.repository.js";
import { hashPassword } from "../../utils/hash.js";
// Only tests the methods in the service layer.

vi.mock("../../repositories/user.repository.js");

describe("User Service testing", () => {
    const userId = "11111111-1111-4111-8111-111111111111";
    const email = "test@gmail.com";
    const password = "password123";

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
            vi.mocked(repository.findByEmail).mockResolvedValue({
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
            vi.mocked(repository.findByEmail).mockResolvedValue(null);
            vi.mocked(repository.createUser).mockResolvedValue({
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
            vi.mocked(repository.findByEmail).mockResolvedValue(null);

            await expect(service.login(email, password)).rejects.toThrow(
                "Invalid email or password."
            );
        });

        it("should throw error when password is incorrect", async () => {
            const hashed = await hashPassword(password);
            vi.mocked(repository.findByEmail).mockResolvedValue({
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
            vi.mocked(repository.findByEmail).mockResolvedValue({
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
});