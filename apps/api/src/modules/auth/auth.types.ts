export interface RegisterInp {
  email: string;
  name: string;
  password: string;
  departmentId?: string;
  role?: 'USER'|'MANAGER'|'ADMIN';
}
export interface LoginInp {
  email: string;
  password: string;
}
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: any;
  token?: string;
}