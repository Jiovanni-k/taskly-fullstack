import jwt , {SignOptions} from "jsonwebtoken";

export interface JwtPayload{
    id: string;
    email: string;
    role: string;
};

const getSecret= (): string =>{
    const secret= process.env.JWT_SECRET;
    if(!secret){
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    return secret;
}

export const signToken= (payload: JwtPayload): string =>{
    const expiresIn = (process.env.JWT_EXPIRES_IN) as SignOptions["expiresIn"];
    return jwt.sign(payload,getSecret(), {expiresIn});

}