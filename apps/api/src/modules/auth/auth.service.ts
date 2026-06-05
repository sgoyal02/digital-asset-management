import { prisma } from '../../lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export class AuthService {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,email: true,name: true,role: true,password: true,
      }
    });
    if (!user || !user.password) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role },JWT_SECRET!,
      { expiresIn: '1hr' }
    );
    const { password:_, ...rest } = user;
    return { user: rest, token };
  }
}