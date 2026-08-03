

import { createTodoTool } from "./tools/createTodo.tool.js";

import { listTodosTool } from "./tools/listTodos.tool.js";

import { getTodoByIdTool } from "./tools/getTodoById.tool.js";

import { updateTodoTool } from "./tools/updateTodo.tool.js";

import { deleteTodoTool } from "./tools/deleteTodo.tool.js";
import type { MCPAuthRequest } from "./auth.js";

type ToolCallParams = {
    name?: string;
    arguments?: Record<string, unknown>;
};

const getToolCallParams = (request: MCPAuthRequest): ToolCallParams => {
    const params = request.params as Record<string, unknown> | undefined;
    const name = typeof params?.name === "string" ? params.name : undefined;
    const rawArguments = params?.arguments;

    const argumentsValue =
        rawArguments && typeof rawArguments === "object" && !Array.isArray(rawArguments)
            ? (rawArguments as Record<string, unknown>)
            : undefined;

    return {
        name,
        arguments: argumentsValue
    };
};

export async function handleRequest(request: MCPAuthRequest) {


    console.error(
        "Received:",
        request.method
    );

    const toolCall = getToolCallParams(request);

    switch(request.method) {


        case "initialize":

            return {

                jsonrpc:"2.0",

                id:request.id,

                result:{

                    protocolVersion:"2025-03-26",

                    capabilities:{

                        tools:{
                            listChanged:false
                        },

                        resources:{
                            listChanged:false
                        }

                    },

                    serverInfo:{

                        name:"todo-mcp-server",

                        version:"1.0.0"

                    }

                }

            };



        case "notifications/initialized":

            return null;



        case "tools/list":

            return {

                jsonrpc:"2.0",

                id:request.id,

                result:{

                    tools:[

                        {
        name:"create_todo",

        description:
        "Creates a todo item",

        inputSchema:{
            type:"object",

            properties:{
                title:{
                    type:"string"
                }
            },

            required:[
                "title"
            ]
        }
    },


    {
        name:"list_todos",

        description:
        "Returns all todo items",

        inputSchema:{
            type:"object",

            properties:{}
        }
    },
    {
    name:"get_todo_by_id",

    description:
    "Gets a single todo item by its ID",

    inputSchema:{
        type:"object",

        properties:{
            id:{
                type:"string"
            }
        },

        required:[
            "id"
        ]
    }
},
{
    name:"update_todo",

    description:
    "Updates an existing todo item",

    inputSchema:{
        type:"object",

        properties:{

            id:{
                type:"string"
            },

            title:{
                type:"string"
            },

            completed:{
                type:"boolean"
            }

        },

        required:[
            "id",
            "title",
            "completed"
        ]
    }
},
{
    name:"delete_todo",

    description:
    "Deletes a todo item by its ID",

    inputSchema:{
        type:"object",

        properties:{
            id:{
                type:"string"
            }
        },

        required:[
            "id"
        ]
    }
}

                    ]

                }

            };



        case "tools/call":


if(toolCall.name === "create_todo") {


    const result =
        await createTodoTool(
            toolCall.arguments
        );


    return {

        jsonrpc:"2.0",

        id:request.id,

        result

    };

}

if(toolCall.name === "get_todo_by_id") {


    const result =
        await getTodoByIdTool(
            toolCall.arguments
        );


    return {

        jsonrpc:"2.0",

        id:request.id,

        result

    };

}

if(toolCall.name === "update_todo") {


    const result =
        await updateTodoTool(
            toolCall.arguments
        );


    return {

        jsonrpc:"2.0",

        id:request.id,

        result

    };

}

if(toolCall.name === "delete_todo") {


    const result =
        await deleteTodoTool(
            toolCall.arguments
        );


    return {

        jsonrpc:"2.0",

        id:request.id,

        result

    };

}



if(toolCall.name === "list_todos") {


    const result =
        await listTodosTool();


    return {

        jsonrpc:"2.0",

        id:request.id,

        result

    };

}


            return {

                jsonrpc:"2.0",

                id:request.id,

                error:{

                    code:-32601,

                    message:"Tool not found"

                }

            };



        case "resources/list":

            return {

                jsonrpc:"2.0",

                id:request.id,

                result:{

                    resources:[]

                }

            };



        default:


            return {

                jsonrpc:"2.0",

                id:request.id,

                error:{

                    code:-32601,

                    message:"Method not found"

                }

            };

    }

}