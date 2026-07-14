import * as repo from "../repositories/user.repository.js";
import { hashPassword, comparePassword} from "../utils/hash.js";
import { signToken } from "../utils/jwt.js";


export const listUsers = async ()=>{
    return await repo.findAll();
}

export const register= async ( email:string, password:string)=>{
    if (!email || !password){
        throw new Error("Email and Password are required.");
    }

    if (process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()){
        throw new Error("This email is reserved and cannot be used for registration.");
    }

    const exist = await repo.findByEmail(email);
    if ( exist ){
        throw new Error("Email already exists.");
    }

    const hashed= await hashPassword(password);
    return await repo.createUser(email,hashed);
}

export const login = async ( email:string, password:string)=>{
    if ( !email || !password ){
        throw new Error ("Email and Password are required.");
    }

    const user = await repo.findByEmail(email);
    if ( !user){
        throw new Error("Invalid email or password.");
    }

    const isValid= await comparePassword(password, user.password);
    if ( !isValid){
        throw new Error("Invalid email or password.")
    }

    const token = signToken({ id:user.id, email:user.email, role:user.role});
    return {
        token,
        user:{
            id: user.id,
            email: user.email,
            role: user.role
        }
    }

}


