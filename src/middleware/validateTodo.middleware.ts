import { Request, Response, NextFunction } from "express";

export const validation = ( req:Request, res:Response, next:NextFunction ) => {

    const title = req.body.title;
    if ( !title ){
        res.status(400).json({
            message : "Title is Required!! "
        });
    }

    next();
}