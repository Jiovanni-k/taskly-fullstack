import { Request, Response, NextFunction } from "express";

export const validation = ( req:Request, res:Response, next:NextFunction ) => {

    const { title , completed }= req.body;
    if ( !title ){
<<<<<<< HEAD
        return res.status(400).json({
=======
       return res.status(400).json({
>>>>>>> 0712e54 (fix: guard todo creation and align tests with userId requirement)
            message : "Title is Required!! "
        });
    }

    next();
}
