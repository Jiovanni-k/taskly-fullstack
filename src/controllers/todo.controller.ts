import { Request , Response } from "express";
import { todos } from "../data/todo.js";

export const getTodos = ( req: Request, res: Response ) => {
    res.json( todos );
}

export const createTodos = ( req: Request, res: Response ) => {

    const newTodo = {
        id:todos.length+1,
        title: req.body.title,
        completed :false 
    };
    todos.push(newTodo);
    res.status(201).json(newTodo);
}

export const getTodoById = ( req: Request , res : Response ) => {
    const id = Number ( req . params . id );
    const todo = todos.find( td => td.id === id );
    if( !todo) {
        res.status(404).json({
            message : "Todo Not Found :( "
        });
    }

    res.status(200).json(todo);
}

export const updateTodo = ( req : Request, res: Response ) => {
    const todo = todos.find( td => td.id === Number(req.params.id));
    if ( !todo ){
        res.status(404).json({
            message : "Todo Not Found :( "
        });
    }
    else if ( todo ){
        todo.title = req.body.title ?? todo.title ;
        todo.completed = req.body.completed ?? todo.completed ;
    }

    res.json(todo);
}

export const deleteTodo = ( req : Request , res : Response )=> {
    const id = Number ( req.params.id);
    const index = todos.findIndex( td => td.id === id);

    if (index >= 0){
        todos.splice(index,1);
        res.status(204).send();
    }
    else if ( index === -1 ){
    res.status(404).json({
        message : "Todo Not Found :("
    });
   }
    //findIndex does not return a boolean so using a true or false scenario is wrong
    //it returns a the number of the index and if the index does not exist it returns -1
    /* else if (!index ){
        res.status(404).json(
            {
                message : "Todo Not Found :( "
            }
        );
    } */
   
}

