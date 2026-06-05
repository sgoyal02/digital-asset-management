import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterInp, LoginInp } from './auth.types';
import { sendError, sendSuccess } from '../../response';

const authService = new AuthService();
export class AuthController{
  async login(req: Request,res: Response) {
    try {
      const {email,password} = req.body;
      const result = await authService.login(email, password);
      return sendSuccess(res, result,'Login success')
    } catch (error: any) {
      return sendError(res, error.message, 401);
    }
  }
}