import * as todoService from "../../services/todo.service.js";

const DEMO_USER = {
    id: "8ec8cce9-88bd-4c28-80aa-6f4daf5d4741",
    role: "user"
};

interface UpdateTodoToolArgs {
    id?: string;
    title?: string;
    completed?: boolean;
}

export async function updateTodoTool(args?: UpdateTodoToolArgs) {
    const existingTodo = await todoService.getTodoById(
        args?.id ?? "",
        DEMO_USER.id,
        DEMO_USER.role
    );

    if (!existingTodo) {
        return {
            content: [
                {
                    type: "text",
                    text: "Todo not found"
                }
            ]
        };
    }

    if ("error" in existingTodo) {
        return {
            content: [
                {
                    type: "text",
                    text: "Forbidden: you cannot update this todo"
                }
            ]
        };
    }

    const todo = await todoService.updateTodo(
        args?.id ?? "",
        args?.title ?? "",
        args?.completed ?? false
    );


    return {
        content:[
            {
                type:"text",
                text:JSON.stringify(todo, null, 2)
            }
        ]
    };

}
