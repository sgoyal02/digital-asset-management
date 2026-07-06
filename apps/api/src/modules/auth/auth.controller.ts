import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { sendError, sendSuccess } from '../../response';
import { ApiError } from '../../types/helper';

const authService = new AuthService();
export class AuthController{
  async login(req: Request,res: Response) {
    try {
      const {email,password} = req.body;
      if (!email || !password) {
        return sendError(res, 'Email and password required', 400);
      }
      const result = await authService.login(email, password);
      return sendSuccess(res, result,'Login success')
    } catch (err: unknown) {
      const e= err as ApiError;
      const code= e.statusCode || 500;
      return sendError(res, e.message, code);
    }
  }

  async refreshToken(req:Request, res:Response) {
    try {
      const {refreshToken} = req.body;
      const result = await authService.refresh(refreshToken);
      return sendSuccess(res, result,'Token refresh success')
    } catch (err:unknown) {
      const e= err as ApiError;
      const code= e.statusCode || 500;
      return sendError(res, e.message, code);
    }
  }
}