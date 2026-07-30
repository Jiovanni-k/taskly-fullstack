import * as todoService from "../../services/todo.service.js";


export async function updateTodoTool(args:any) {


    const todo = await todoService.updateTodo(
        args.id,
        args.title,
        args.completed
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