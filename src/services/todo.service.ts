
import * as repository from "../repositories/todo.repository.js";
import * as userRepository from "../repositories/user.repository.js";

export const getAllTodos = async () => {

    const todo = await repository.findAll();
    return todo;
}

export const getTodoById = async ( id : string )=>{
    return await repository.findById(id);
}

export const createTodo = async ( title : string, userId:string)=>{

    if ( !userId || userId.trim()===""){
        return { error: "MISSING_USER_ID"};
    }

    const user = await userRepository.findById(userId);

    if (!user) {
        return { error: "USER_NOT_FOUND" };
    }
     
    return await repository.insert(title, userId);
}

export const updateTodo = async ( id :string, title: string, completed:boolean)=>{

    const exist = await repository.findById(id);

    if (!exist) {
        return null;
    }

    if ( title === undefined || completed === undefined ){
       return { error : "MISSING_FIELD"};
        }
        
        return await repository.update(id,title,completed);
    
}

export const deleteTodo = async ( id : string )=>{
    
    const exist = await repository.findById(id);

    if ( !exist ){
        return null;
    }

    return await repository.remove(id);
}
