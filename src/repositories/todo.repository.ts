import { prisma } from "../config/prisma.js";
import { TodoQuery, TodoWhereFilter, TodoOrderBy } from "../dtos/todo.dto.js";

export const findAll= async ( query?:TodoQuery) =>{

    if ( !query ){
        return await prisma.todos.findMany();
    }

   const { page, limit, sortBy, order, completed, title } = query;

   const where: TodoWhereFilter = {};

   if ( completed !== undefined ){
    where.completed=completed;
   }

   if ( title ){
    where.title={
        contains: title,
        mode: 'insensitive'
    }
   }

   const orderBy: TodoOrderBy = {};

   orderBy[sortBy || 'createdAt']= order || 'desc';

   const offset = ( page -1 ) * limit ;

   const [ todos, total ]= await Promise.all([
    prisma.todos.findMany({
        where,
        orderBy,
        skip:offset,
        take:limit
    }),
    prisma.todos.count({where})
   ]);
   return { todos , total }
    
}

export const insert = async (  title : string , userId: string )=>{
    return await prisma.todos.create({
        data: {
            title ,
            completed : false,
            userId : userId
        }
    })
}

export const findById = async ( id: string )=>{
    return await prisma.todos.findUnique({
        where : { id }
    })
}

export const update = async ( id:string, title:string, completed: boolean )=>{
    return await prisma.todos.update({
        where : {id},
        data :{
            title  ,
            completed 
        }
    })
}

export const remove = async ( id : string )=>{
    await prisma.todos.delete({
        where : { id }
    });
    return true;
}