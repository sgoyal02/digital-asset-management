import { NextFunction, Request, Response } from "express";
import { AuthReq } from "./auth.middleware";
import { sendError } from "../response";


export const roleMiddleware=(...roles:("USER"| "MANAGER"| "ADMIN")[])=>{
return (req: AuthReq, res: Response, next:NextFunction)=>{
    if(!req.user?.role)
        return sendError(res, 'unauthorized', 401);
    if(!roles.includes(req.user.role))
        return sendError(res, 'access denied.', 403);
    next();
}
}