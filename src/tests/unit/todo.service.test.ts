import { beforeEach, describe , expect, it , vi} from "vitest"; 
import * as service from "../../services/todo.service.js";
import * as repository from "../../repositories/todo.repository.js";
import * as userRepository from "../../repositories/user.repository.js";
// Only tests the methods in the service layer.

vi.mock("../../repositories/todo.repository.js");
vi.mock("../../repositories/user.repository.js");


describe ("Todo list Service testing",  ()=>{

    const todoId = "550e8400-e29b-41d4-a716-446655440000"; //random UUID for testing purposes
    const userId = "11111111-1111-4111-8111-111111111111";
    const otherUserId = "22222222-2222-4222-8222-222222222222";

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return error when title is empty", async ()=>{
        await expect(service.createTodo("",userId)).resolves.toEqual({ error: "MISSING_TITLE" });

    });

    it("should create todo",  async()=>{
        vi.mocked(userRepository.findById).mockResolvedValue({
            id: userId,
            email: "test@gmail.com",
            password: "hashed",
            role: "user"
        });
        vi.mocked(repository.insert).mockResolvedValue({
            id : todoId,
            title : "Clean Room",
            completed : false,
            userId : userId
        });
        const result = await service.createTodo("Clean Room", userId);
        if ("error" in result) {
            throw new Error(`Expected todo, received ${result.error}`);
        }
        expect ( result.title ).toBe("Clean Room");
    })

    it ("should return every todo regardless of who is asking (public route)", async()=>{
        vi.mocked(repository.findAll).mockResolvedValue([
            { id : todoId, title : "mine", completed : false, userId : userId },
            { id : "other-id", title : "not mine", completed : false, userId : otherUserId }
        ]);

        const result = await service.getAllTodos();
        expect(repository.findAll).toHaveBeenCalled();
        expect(result).toHaveLength(2);
    })

    it ("should return error when fields are missing", async()=>{
        const result = await service.updateTodo(todoId,undefined as unknown as string, true, userId, "user");

        expect(result).toEqual({error : "MISSING_FIELD"});

    });

    it ("should return null if todo does not exist", async()=>{
        vi.mocked(repository.findById).mockResolvedValue(null);

        const result = await service.updateTodo(todoId,"Clean Room",true, userId, "user");
        expect(result).toBeNull();

    });

    it ("should update todo successfully when the requester is the owner", async()=>{
        vi.mocked(repository.findById).mockResolvedValue({
            id : todoId,
            title : "old title",
            completed : false,
            userId : userId
        });

        vi.mocked(repository.update).mockResolvedValue({
            id : todoId,
            title : "new title",
            completed : true,
            userId : userId
        });

        const result = await service.updateTodo(todoId,"new title", true, userId, "user");
        expect ( result ).toEqual ({
            id : todoId, 
            title : "new title", 
            completed : true,
            userId : userId
        });
    })

    it ("should return FORBIDDEN when a non-owner, non-admin tries to update", async()=>{
        vi.mocked(repository.findById).mockResolvedValue({
            id : todoId,
            title : "old title",
            completed : false,
            userId : userId
        });

        const result = await service.updateTodo(todoId,"new title", true, otherUserId, "user");
        expect ( result ).toEqual({ error : "FORBIDDEN" });
    })

    it ("should allow an admin to update someone else's todo", async()=>{
        vi.mocked(repository.findById).mockResolvedValue({
            id : todoId,
            title : "old title",
            completed : false,
            userId : userId
        });

        vi.mocked(repository.update).mockResolvedValue({
            id : todoId,
            title : "new title",
            completed : true,
            userId : userId
        });

        const result = await service.updateTodo(todoId,"new title", true, otherUserId, "admin");
        expect ( result ).toEqual ({
            id : todoId, 
            title : "new title", 
            completed : true,
            userId : userId
        });
    })

    it ("should return FORBIDDEN when a non-owner, non-admin tries to view someone else's todo", async()=>{
        vi.mocked(repository.findById).mockResolvedValue({
            id : todoId,
            title : "old title",
            completed : false,
            userId : userId
        });

        const result = await service.getTodoById(todoId, otherUserId, "user");
        expect ( result ).toEqual({ error : "FORBIDDEN" });
    })

    it ("should return FORBIDDEN when a non-owner, non-admin tries to delete", async()=>{
        vi.mocked(repository.findById).mockResolvedValue({
            id : todoId,
            title : "old title",
            completed : false,
            userId : userId
        });

        const result = await service.deleteTodo(todoId, otherUserId, "user");
        expect ( result ).toEqual({ error : "FORBIDDEN" });
    })
});
