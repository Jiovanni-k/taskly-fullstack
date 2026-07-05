import { Request,Response, NextFunction} from "express";

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i; // took this from Google

export const validateUuid = ( req:Request, res: Response, next:NextFunction) => {

    const {id}= req.params;

    if ( typeof id !=="string" || !uuidRegex.test(id)){
        return res.status(400).json({
            message: "Invalid Id"
        });
    }
    
    next();
}
