import * as todoService from "../../services/todo.service.js";


const DEMO_USER = {
    id: "8ec8cce9-88bd-4c28-80aa-6f4daf5d4741",
    role: "user"
};


export async function getTodoByIdTool(args: any) {


    const todo = await todoService.getTodoById(
        args.id,
        DEMO_USER.id,
        DEMO_USER.role
    );


    if (!todo) {

        return {
            content:[
                {
                    type:"text",
                    text:"Todo not found"
                }
            ]
        };

    }


    if ("error" in todo) {

        return {
            content:[
                {
                    type:"text",
                    text:"Forbidden: this todo does not belong to the demo user"
                }
            ]
        };

    }


    return {
        content:[
            {
                type:"text",
                text:JSON.stringify(todo, null, 2)
            }
        ]
    };

}