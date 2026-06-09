import { NextFunction, Request, Response } from "express";
import { sendError } from "../response";
import jwt from 'jsonwebtoken';

export interface AuthReq extends Request{
    user?: {
        id: number;
        email: string;
        role: "USER"| "MANAGER"| "ADMIN";
    }
}
const JWT_SECRET = process.env.JWT_SECRET!;

export const AuthMiddleware = (req: AuthReq, res: Response, next: NextFunction) => {

    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    if (!token) {
        return sendError(res, 'access token missing', 401);
    }
    try {
        const decoded:any = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        return sendError(res, 'invalid/expired token', 401);
    }

}