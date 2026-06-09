import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { AuthContextType, User } from "../utils/types";


const AuthContext= createContext<AuthContextType|null>(null);

export const AuthProvider = ({children}:{children:React.ReactNode}) =>{
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken]= useState<string|null>(null);
    const [isLoad, setLoad] = useState<boolean>(true);

      const clearStorage=()=>{
        localStorage.clear();
        sessionStorage.clear();
    }

    useEffect(()=>{
        const fetchToken= localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        const fetchUser= localStorage.getItem('user')|| sessionStorage.getItem('user');
        if(fetchToken && fetchUser){
            try{
                setToken(fetchToken);
                setUser(JSON.parse(fetchUser));
            } catch (err) {
                console.error("parse err: ", err);
                clearStorage();
            }
        }
        setLoad(false);
    },[]);

    const setAuthData= useCallback((tokenData:string, user:User,isCheck:boolean=true, next:any)=>{
        clearStorage();
        const storage = isCheck ? localStorage : sessionStorage;
        storage.setItem('accessToken', tokenData);
        storage.setItem('user', JSON.stringify(user));
        setToken(tokenData);
        setUser(user);
        if(next) next();
    },[]);

    const logout= useCallback(()=>{
        clearStorage();
        setUser(null);
        setToken(null);
    },[]);

    const isAuthenticated = !!token && !!user;

    return(
        <AuthContext.Provider value={{user, token, logout, isLoad, isAuthenticated,setAuthData}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth=()=>{
    const c= useContext(AuthContext);
    if(!c){
        throw new Error("useAuth must be in auth-provider");
    }
    return c;
}