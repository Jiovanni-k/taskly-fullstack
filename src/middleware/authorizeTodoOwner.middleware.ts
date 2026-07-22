import { Request, Response, NextFunction } from "express";
import * as repository from "../repositories/todo.repository.js";

export const authorizeTodoOwner = async ( req:Request, res:Response, next:NextFunction ) => {

    const id = String ( req.params.id );

    try {
        const todo = await repository.findById(id);

        if ( !todo ){
            return res.status(404).json({
                message : "Todo Not Found :("
            });
        }

        const isOwner = todo.userId === req.user!.id || req.user!.role === "admin";

        if ( !isOwner ){
            return res.status(403).json({
                message : "Forbidden. You do not have permission to modify this todo."
            });
        }

        next();
    }
    catch ( _error ){
        console.error(_error);
        return res.status(500).json({
            message : "Error Updating the todo."
        });
    }
}