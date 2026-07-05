
import * as repository from "../repositories/todo.repository.js";

export const getAllTodos = async () => {

    const todo = await repository.findAll();
    return todo;
}

export const getTodoById = async ( id : string )=>{
    return await repository.findById(id);
}

export const createTodo = async ( title : string  )=>{

    if ( title.trim()=== ""){
        throw new Error ("title should not be empty.");
    }
     
    return await repository.insert(title);
}

export const updateTodo = async ( id :string, title: string, completed:boolean)=>{

    if ( title === undefined || completed === undefined ){
       return { error : "MISSING_FIELD"};
        }

        const exist = await repository.findById(id);
        if ( !exist ){
            return null;
        }
        
        return await repository.update(id,title,completed);
    
}

export const deleteTodo = async ( id : string )=>{
    
    return await repository.remove(id);
}
