
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