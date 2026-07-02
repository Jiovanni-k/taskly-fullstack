import * as repo from "../repositories/user.repository.js";
import { hashPassword} from "../utils/hash.js";

export const register= async ( email:string, password:string)=>{
    if (!email || !password){
        throw new Error("Email and Password are required.");
    }

    const exist = await repo.findByEmail(email);
    if ( exist ){
        throw new Error("Email already exists.");
    }

    const hashed= await hashPassword(password);
    return await repo.createUser(email,hashed);
}
