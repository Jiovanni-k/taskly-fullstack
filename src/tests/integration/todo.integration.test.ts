import app  from "../../app.js";
import { beforeEach, afterAll ,describe, expect, it } from "vitest";
import request from "supertest";
import { prisma } from "../../config/prisma.js";

describe ("Todo list integration tests.", ( )=>{
    let userId : string;

    beforeEach ( async()=>{
        await prisma.todos.deleteMany();
        await prisma.user.deleteMany();
        const user = await prisma.user.create({
            data:{
                email:"test@gmail.com",
                password:"password123"
            }
        })
        userId=user.id;
    });

    afterAll(async()=>{
        await prisma.$disconnect();
    });
    
    it("should get all the todos", async()=>{
        const response = await request(app).get("/todos");

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
    
    it("should create todo", async ()=>{
        const response = await request(app).post("/todos").send({
            title : "Testing",
            userId : userId
        });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("id");
        expect(response.body.title).toBe("Testing");
        expect(response.body.completed).toBe(false);

    });

    it("should get todo by Id", async ()=>{
        const created = await request(app).post(`/todos`).send({
            title : "Test Creation",
            userId:userId
        });
        const id = created.body.id;
        const response = await request(app).get(`/todos/${id}`);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            id : id,
            title : "Test Creation",
            completed : false,
            userId:userId
        });
        });
    
    
    it ("should update Todo", async ()=>{
        const created = await request(app).post("/todos").send({
            title : "old title",
            userId:userId
        });
        const id = created.body.id;
        const response = await request(app).put(`/todos/${id}`).send({
            title : "new title",
            completed : true,
            userId:userId
        });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            id : id,
            title : "new title",
            completed : true,
            userId:userId
        });

    });

    it("should return 404 when updating non existent todo", async()=>{
        const nonExistentId = "550e8400-e29b-41d4-a716-446655440099"; // Random UUID not in the Database
        const response = await request(app).put(`/todos/${nonExistentId}`).send({
            title : "Anything",
            completed : false
        });
        expect (response.status).toBe(404);
    });

    it ("should return 400 when updating a todo with a missing requirement", async()=>{
        const created = await request(app).post("/todos").send({
            title : "Finish the Task.",
            userId:userId
        });
        const id = created.body.id;
        const response = await request(app).put( `/todos/${id}`).send({
            title : "Finish the task now."
        });
        expect(response.status).toBe(400); // Because i should update the completed as well.
    })

    
    it ("should return 400 when the Id is not a valid UUID", async()=>{
        const response = await request(app).put("/todos/999").send({
            title: "Not Going to Work",
            completed: true
        });
        
        expect( response.status).toBe(400);
    })

    it("should delete todo", async()=>{
        const created = await request(app).post("/todos").send({
            title : "deleted",
            userId:userId
        });

        const id = created.body.id;
        const response = await request(app).delete(`/todos/${id}`);
        expect ( response.status).toBe(204);
        
        const getRes = await request(app).get(`/todos/${id}`);
        expect(getRes.status).toBe(404);
    })

});


