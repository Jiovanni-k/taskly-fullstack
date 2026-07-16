import app  from "../../app.js";
import { beforeEach, afterAll ,describe, expect, it } from "vitest";
import request from "supertest";
import { prisma } from "../../config/prisma.js";
import { hashPassword } from "../../utils/hash.js";

describe ("Todo list integration tests.", ( )=>{
    let userAId : string;
    let userAToken : string;
    let userBToken : string;
    let adminToken : string;

    beforeEach ( async()=>{
        await prisma.todos.deleteMany();
        await prisma.user.deleteMany();

        await request(app).post("/users/register").send({ email: "userA@gmail.com", password: "password123" });
        await request(app).post("/users/register").send({ email: "userB@gmail.com", password: "password123" });

        // An admin can't be created through the public API - only seeded directly.
        await prisma.user.create({
            data: {
                email: "admin@gmail.com",
                password: await hashPassword("password123"),
                role: "admin"
            }
        });

        const userALogin = await request(app).post("/users/login").send({ email: "userA@gmail.com", password: "password123" });
        const userBLogin = await request(app).post("/users/login").send({ email: "userB@gmail.com", password: "password123" });
        const adminLogin = await request(app).post("/users/login").send({ email: "admin@gmail.com", password: "password123" });

        userAId = userALogin.body.user.id;
        userAToken = userALogin.body.token;
        userBToken = userBLogin.body.token;
        adminToken = adminLogin.body.token;
    });

    afterAll(async()=>{
        await prisma.$disconnect();
    });

    describe("GET /todos is public", ()=>{
        it("should list every todo without a token", async()=>{
            await request(app).post("/todos").set("Authorization", `Bearer ${userAToken}`).send({ title : "Mine" });
            await request(app).post("/todos").set("Authorization", `Bearer ${userBToken}`).send({ title : "Not mine" });

            const response = await request(app).get("/todos");

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
        });

        it("should sort todos by updatedAt", async()=>{
            const first = await request(app).post("/todos").set("Authorization", `Bearer ${userAToken}`).send({ title : "First" });
            const second = await request(app).post("/todos").set("Authorization", `Bearer ${userAToken}`).send({ title : "Second" });

            // Editing "First" after "Second" was created makes First's updatedAt the most recent.
            await request(app)
                .put(`/todos/${first.body.id}`)
                .set("Authorization", `Bearer ${userAToken}`)
                .send({ title : "First - edited", completed : true });

            const response = await request(app).get("/todos?sortBy=updatedAt&order=desc");

            expect(response.status).toBe(200);
            expect(response.body.data[0].id).toBe(first.body.id);
            expect(response.body.data[1].id).toBe(second.body.id);
        });
    });

    describe("Everything else requires authentication", ()=>{
        it("should reject unauthenticated requests to write/detail routes", async()=>{
            expect((await request(app).post("/todos").send({ title: "x" })).status).toBe(401);
            expect((await request(app).get(`/todos/550e8400-e29b-41d4-a716-446655440000`)).status).toBe(401);
            expect((await request(app).put(`/todos/550e8400-e29b-41d4-a716-446655440000`).send({ title: "x", completed: true })).status).toBe(401);
            expect((await request(app).delete(`/todos/550e8400-e29b-41d4-a716-446655440000`)).status).toBe(401);
        });
    });
    
    it("should create a todo owned by the logged-in user", async ()=>{
        const response = await request(app)
            .post("/todos")
            .set("Authorization", `Bearer ${userAToken}`)
            .send({ title : "Testing" });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("id");
        expect(response.body.title).toBe("Testing");
        expect(response.body.completed).toBe(false);
        expect(response.body.userId).toBe(userAId);
    });

    it("should let the owner get their todo by id", async ()=>{
        const created = await request(app).post(`/todos`).set("Authorization", `Bearer ${userAToken}`).send({ title : "Test Creation" });
        const id = created.body.id;

        const response = await request(app).get(`/todos/${id}`).set("Authorization", `Bearer ${userAToken}`);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            id : id,
            title : "Test Creation",
            completed : false,
            userId : userAId,
            createdAt : expect.any(String),
            updatedAt : expect.any(String)
        });
    });

    it("should return 403 when a different user tries to view someone else's todo", async ()=>{
        const created = await request(app).post(`/todos`).set("Authorization", `Bearer ${userAToken}`).send({ title : "Test Creation" });
        const id = created.body.id;

        const response = await request(app).get(`/todos/${id}`).set("Authorization", `Bearer ${userBToken}`);
        expect(response.status).toBe(403);
    });

    it("should let an admin view someone else's todo", async ()=>{
        const created = await request(app).post(`/todos`).set("Authorization", `Bearer ${userAToken}`).send({ title : "Test Creation" });
        const id = created.body.id;

        const response = await request(app).get(`/todos/${id}`).set("Authorization", `Bearer ${adminToken}`);
        expect(response.status).toBe(200);
    });

    it("should return 404 for a non-existent todo id", async ()=>{
        const nonExistentId = "550e8400-e29b-41d4-a716-446655440099";
        const response = await request(app).get(`/todos/${nonExistentId}`).set("Authorization", `Bearer ${userAToken}`);
        expect(response.status).toBe(404);
    });

    it ("should let the owner update their todo", async ()=>{
        const created = await request(app).post("/todos").set("Authorization", `Bearer ${userAToken}`).send({ title : "old title" });
        const id = created.body.id;

        const response = await request(app)
            .put(`/todos/${id}`)
            .set("Authorization", `Bearer ${userAToken}`)
            .send({ title : "new title", completed : true });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            id : id,
            title : "new title",
            completed : true,
            userId : userAId,
            createdAt : expect.any(String),
            updatedAt : expect.any(String)
        });
    });

    it("should return 403 when a different user tries to update someone else's todo", async ()=>{
        const created = await request(app).post("/todos").set("Authorization", `Bearer ${userAToken}`).send({ title : "old title" });
        const id = created.body.id;

        const response = await request(app)
            .put(`/todos/${id}`)
            .set("Authorization", `Bearer ${userBToken}`)
            .send({ title : "hacked", completed : true });

        expect(response.status).toBe(403);
    });

    it("should let an admin update someone else's todo", async ()=>{
        const created = await request(app).post("/todos").set("Authorization", `Bearer ${userAToken}`).send({ title : "old title" });
        const id = created.body.id;

        const response = await request(app)
            .put(`/todos/${id}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ title : "fixed by admin", completed : true });

        expect(response.status).toBe(200);
        expect(response.body.title).toBe("fixed by admin");
    });

    it("should return 404 when updating a non existent todo", async()=>{
        const nonExistentId = "550e8400-e29b-41d4-a716-446655440099";
        const response = await request(app)
            .put(`/todos/${nonExistentId}`)
            .set("Authorization", `Bearer ${userAToken}`)
            .send({ title : "Anything", completed : false });
        expect (response.status).toBe(404);
    });

    it ("should return 400 when updating a todo with a missing requirement", async()=>{
        const created = await request(app).post("/todos").set("Authorization", `Bearer ${userAToken}`).send({ title : "Finish the Task." });
        const id = created.body.id;

        const response = await request(app)
            .put( `/todos/${id}`)
            .set("Authorization", `Bearer ${userAToken}`)
            .send({ title : "Finish the task now." });
        expect(response.status).toBe(400); // Because i should update the completed as well.
    })

    it ("should return 400 when the Id is not a valid UUID", async()=>{
        const response = await request(app)
            .put("/todos/999")
            .set("Authorization", `Bearer ${userAToken}`)
            .send({ title: "Not Going to Work", completed: true });
        
        expect( response.status).toBe(400);
    })

    it("should let the owner delete their todo", async()=>{
        const created = await request(app).post("/todos").set("Authorization", `Bearer ${userAToken}`).send({ title : "deleted" });
        const id = created.body.id;

        const response = await request(app).delete(`/todos/${id}`).set("Authorization", `Bearer ${userAToken}`);
        expect ( response.status).toBe(204);
        
        const getRes = await request(app).get(`/todos/${id}`).set("Authorization", `Bearer ${userAToken}`);
        expect(getRes.status).toBe(404);
    })

    it("should return 403 when a different user tries to delete someone else's todo", async()=>{
        const created = await request(app).post("/todos").set("Authorization", `Bearer ${userAToken}`).send({ title : "not yours" });
        const id = created.body.id;

        const response = await request(app).delete(`/todos/${id}`).set("Authorization", `Bearer ${userBToken}`);
        expect ( response.status).toBe(403);
    })

    it("should let an admin delete someone else's todo", async()=>{
        const created = await request(app).post("/todos").set("Authorization", `Bearer ${userAToken}`).send({ title : "removable" });
        const id = created.body.id;

        const response = await request(app).delete(`/todos/${id}`).set("Authorization", `Bearer ${adminToken}`);
        expect ( response.status).toBe(204);
    })

});