import { prisma } from '../../lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

export class AuthService {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email}
    });
    if (!user || user.password!==password) {
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }
      //user data add to jwt
    const token = jwt.sign({id:user.id, email: user.email, role: user.role, managerId:user.managerId},JWT_SECRET!,
      { expiresIn: '1Hr' }
    );
    const refreshToken = jwt.sign({ id: user.id },JWT_REFRESH_SECRET!,{ expiresIn: "7d" });
    const { password:_, ...rest } = user;
    return { user: rest, token, refreshToken };
  }

  async refresh(refToken:string) {
    try {
      const decoded= jwt.verify(refToken, JWT_REFRESH_SECRET!) as {id: number};
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });
      if (!user) {
        throw Object.assign(new Error("User not found"), {statusCode: 404});
      }

    const newToken = jwt.sign({id:user.id, email: user.email, role: user.role, managerId:user.managerId},JWT_SECRET!,
      { expiresIn: '1DAY' }
    );

      return {accessToken: newToken };
    } catch {
      throw Object.assign(new Error("Invalid ref token"), {statusCode: 401});
    }
  }
}