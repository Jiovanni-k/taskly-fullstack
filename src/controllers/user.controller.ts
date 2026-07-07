import { Request,Response } from "express";
import * as service from "../services/user.service.js";

export const register = async(req: Request, res:Response)=>{
    
    try{
        const { email,password }= req.body;
        const user = await service.register(email,password);
        
        return res.status(201).json({
            id: user.id,
            email: user.email
        });
    }
    catch (error:any){
        return res.status(400).json({
            message : error.message
        });
    }
}

export const login = async ( req:Request,res:Response)=>{
    try{
        const { email,password}=req.body;
        
        const result = await service.login(email,password);
        return res.status(200).json(result);
    }
    catch (error:any){
        return res.status(401).json({
            message : error.message
        });
    }
};

export const me = async ( req:Request, res:Response )=>{
    return res.status(200).json({
        user : req.user
    });
}
