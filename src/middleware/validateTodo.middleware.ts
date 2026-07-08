import { Request, Response, NextFunction } from "express";
// This is only for the POST todo
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i; 

export const validation = ( req:Request, res:Response, next:NextFunction ) => {

    const { title, userId }= req.body;

    if ( !title || title.trim()===""){

        return res.status(400).json({
            message : "Title is Required!! "
        });
    }

    if (  typeof userId !== "string" || !uuidRegex.test(userId)){
        return res.status(400).json({
            message : "Invalid UserId!! "
        });
    }

    next();
}
