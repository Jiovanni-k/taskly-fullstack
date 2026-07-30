import { createTodo } from "../../services/todo.service.js";


export async function createTodoTool(args:any) {


    const DEMO_USER_ID = "8ec8cce9-88bd-4c28-80aa-6f4daf5d4741";


    const todo = await createTodo(
        args.title,
        DEMO_USER_ID
    );


    if ("error" in todo) {

        return {

            content:[
                {
                    type:"text",
                    text:`Error creating todo: ${todo.error}`
                }
            ]

        };

    }


    return {

        content:[

            {
                type:"text",

                text:
                `Created todo:
ID: ${todo.id}
Title: ${todo.title}`

            }

        ]

    };


}