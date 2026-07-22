import { Request, Response, NextFunction } from "express";

export const validateUpdateTodo = ( req:Request, res:Response, next:NextFunction ) => {

    const { title, completed } = req.body;

    if ( title === undefined || completed === undefined ){
        return res.status(400).json({
            message : "Title and Completed are required."
        });
    }

    if ( typeof title !== "string" || title.trim() === ""){
        return res.status(400).json({
            message : "Title and Completed are required."
        });
    }

    if ( typeof completed !== "boolean" ){
        return res.status(400).json({
            message : "Title and Completed are required."
        });
    }

    next();
}