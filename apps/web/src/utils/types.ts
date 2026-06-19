export const formatDate=(dateParam: string): string=> {
  return new Date(dateParam).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}


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
  mimeType: string;
  size: number;
  status: 'PENDING'|'UPLOADED'|'FAILED'|'UNDER_REVIEW'|'APPROVED'|'REJECTED'|'EXPIRED'| 'ARCHIVED';
  ownerId: number;
  owner?: {
    name: string;
    department: {name:string};
  };
  createdAt: string;
  updatedAt?: string;
  expiryDate?:string,
  versions:[],
  duration:number;
  isArchived:boolean;
  isDupe:boolean;
  fileKey:string;
}

export interface Collection{
  id:number;
  name:string;
  description?:string|null;
  isShared:boolean;
  createdAt:string;
  ownerId:number;
  _count?:{assets:number};
  owner?: {name:string};
}

export type ModalMode={type:"move"|"copy";assetId: number, cId:number|null}|null;
export interface CollectionAsset {
  id:number;
  fileName:string;
  mimeType:string;
  size:string;
  status:string;
  thumbnailUrl?: string| null;
}
export interface CollectionDetail {
  id: number;
  name: string;
  description?: string | null;
  isShared: boolean;
}
