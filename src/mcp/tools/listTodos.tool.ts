import { getAllTodos } from "../../services/todo.service.js";

const DEMO_USER_ID = "8ec8cce9-88bd-4c28-80aa-6f4daf5d4741";

export async function listTodosTool() {
    const result = await getAllTodos();
    const todos = Array.isArray(result) ? result : result.todos;
    const userTodos = todos.filter((todo) => todo.userId === DEMO_USER_ID);

    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(userTodos, null, 2)
            }
        ]
    };

}
