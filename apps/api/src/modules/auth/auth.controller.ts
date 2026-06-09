import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginInp } from './auth.types';
import { sendError, sendSuccess } from '../../response';

const authService = new AuthService();
export class AuthController{
  async login(req: Request,res: Response) {
    console.log("login body: ", req.body);
    try {
      const {email,password} = req.body;
      if (!email || !password) {
        return sendError(res, 'Email and password required', 400);
      }
      const result = await authService.login(email, password);
      return sendSuccess(res, result,'Login success')
    } catch (error: any) {
      const code= error.statusCode || 500;
      return sendError(res, error.message, code);
    }
  }
}