import { getAllTodos } from "../../services/todo.service.js";


export async function listTodosTool() {

    const todos = await getAllTodos();


    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(todos, null, 2)
            }
        ]
    };

}