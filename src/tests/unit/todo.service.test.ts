import { describe , expect, it , vi} from "vitest"; 
import * as service from "../../services/todo.service.js";
import * as repository from "../../repositories/todo.repository.js";
// Only tests the methods in the service layer.

vi.mock("../../repositories/todo.repository.js");


describe ("Todo list Service testing",  ()=>{

    const todoId = "550e8400-e29b-41d4-a716-446655440000"; //random UUID for testing purposes

    it("should throw error when title is empty", async ()=>{
        await expect(service.createTodo("")).rejects.toThrow("title should not be empty");

    });

    it("should create todo",  async()=>{
        vi.mocked(repository.insert).mockResolvedValue({
            id : todoId,
            title : "Clean Room",
            completed : false
        });
        const result = await service.createTodo("Clean Room");
        expect ( result.title ).toBe("Clean Room");
    })

    

    it ("should return error when fields are missing", async()=>{
        const result = await service.updateTodo(todoId,undefined as any, true);

        expect(result).toEqual({error : "MISSING_FIELD"});

    });

    it ("should return error if todo does not exist", async()=>{
        vi.mocked(repository.findById).mockResolvedValue(null);

        const result = await service.updateTodo(todoId,"Clean Room",true);
        expect(result).toBeNull();

    });

    it ("should update todo successfully", async()=>{
        vi.mocked(repository.findById).mockResolvedValue({
            id : todoId,
            title : "old title",
            completed : false
        });

        vi.mocked(repository.update).mockResolvedValue({
            id : todoId,
            title : "new title",
            completed : true
        });

        const result = await service.updateTodo(todoId,"new title", true);
        expect ( result ).toEqual ({
            id : todoId, 
            title : "new title", 
            completed : true
        });
    })
});                                        
