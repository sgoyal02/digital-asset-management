export interface HeaderProp{
    toggleSidebar:()=>void
}

export interface ApiReqConfig{
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string;
    data?: any;
    params?: Record<string, any>;
    headers?: Record<string, string>;
    timeout?: number;
    signal?: AbortSignal;
}

export interface User{
    id:number;
    email:string;
    name:string;
    role:'USER'| 'ADMIN'| 'MANAGER';
}
export interface AuthContextType{
    user: User|null;
    token?: string|null;
    logout:() => void;
    isLoad: boolean; 
    isAuthenticated: boolean;
    setAuthData:(tokenData:string, user:User,isCheck?:boolean, next?:any) => void;
}
export interface ErrMsgProps {
  msg?:string| null;
  className?:string;
  showIcon?:boolean;
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

export interface Asset {
  id: number;
  fileName: string;
  fileUrl:string;
  fileType: string;
  fileSize: number;
  status: 'PENDING'|'UPLOADED'|'FAILED'|'UNDER_REVIEW'|'APPROVED'|'REJECTED'|'EXPIRED'| 'ARCHIVED';
  ownerId: number;
  owner?: {
    name: string;
  };
  uploadedAt: string;
  updatedAt?: string;
}