
import { prisma } from "../config/prisma.js";

export const findAll= async ()=>{

    return await prisma.todos.findMany();
    
}

export const insert = async (  title : string , userId: number )=>{
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
        where : { id  }
    });
    return true;
}