import { prisma } from '../../lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export class AuthService {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      // include:{department: true},
      select: {
        id: true,email: true,name: true,role: true,password: true,
        managerId:true
      }
    });
    if (!user || !user.password) {
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }
      //user data add to jwt
    const token = jwt.sign({id:user.id, email: user.email, role: user.role, managerId:user.managerId},JWT_SECRET!,
      { expiresIn: '1hr' }
    );
    const { password:_, ...rest } = user;
    return { user: rest, token };
  }
}