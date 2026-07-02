import { prisma } from "../config/prisma.js";


export const findByEmail = async ( email : string )=>{
    return await prisma.user.findUnique({
        where :{email}
    });
}

