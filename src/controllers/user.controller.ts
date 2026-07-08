import { Request,Response } from "express";
import * as service from "../services/user.service.js";

const getErrorMessage = (error: unknown) => {
    return error instanceof Error ? error.message : "Unexpected error.";
};

export const register = async(req: Request, res:Response)=>{
    
    try{
        const { email,password }= req.body;
        const user = await service.register(email,password);
        
        return res.status(201).json({
            id: user.id,
            email: user.email
        });
    }
    catch (error: unknown){
        return res.status(400).json({
            message : getErrorMessage(error)
        });
    }
}

export const login = async ( req:Request,res:Response)=>{
    try{
        const { email,password}=req.body;
        
        const result = await service.login(email,password);
        return res.status(200).json(result);
    }
    catch (error: unknown){
        return res.status(401).json({
            message : getErrorMessage(error)
        });
    }
};

export const me = async ( req:Request, res:Response )=>{
    return res.status(200).json({
        user : req.user
    });
}

export const listUsers = async(req: Request, res:Response)=>{
    try{
        const users = await service.listUsers();
        return res.status(200).json(users);
    }
    catch (_error){
        return res.status(500).json({
            message : "Error listing users."
        });
    }
}
