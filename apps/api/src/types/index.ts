export interface ApiResponse<T=any> {
  success:boolean,
  statusCode:number,
  msg: string,
  data?:T|null,
  err:string|null
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

export interface DashboardStats{
  totalAssets: number;
  expring: number;
  dupes: number;
  risk: number;
  processStatus: {
    pending: number;
    failed: number;
    pendingPer: number;
    failedPer: number;
  };
}