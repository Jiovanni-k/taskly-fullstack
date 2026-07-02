import { prisma } from "../config/prisma.js";


export const findByEmail = async ( email : string )=>{
    return await prisma.user.findUnique({
        where :{email}
    });
};

export const createUser = async ( email: string, password: string)=>{
    return await prisma.user.create({
        data:{
            email, password
        }
    });
};

