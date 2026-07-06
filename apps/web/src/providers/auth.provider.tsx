import { useCallback, useEffect, useState } from "react";
import { User } from "../utils/types";
import { AuthContext } from "../context/auth.context";

export const AuthProvider = ({children}:{children:React.ReactNode}) =>{
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken]= useState<string|null>(null);
    const [isLoad, setLoad] = useState<boolean>(true);
    const [refToken, setRefToken] = useState<string | null>(null);

      const clearStorage=()=>{
        localStorage.clear();
        sessionStorage.clear();
    }

    useEffect(()=>{
        const fetchToken= localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        const refreshToken=localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");
        const fetchUser= localStorage.getItem('user')|| sessionStorage.getItem('user');
        if(fetchToken && refreshToken && fetchUser){
            try{
                setToken(fetchToken);
                setRefToken(refreshToken);
                setUser(JSON.parse(fetchUser));
            } catch{
                clearStorage();
            }
        }
        setLoad(false);
    },[]);

    const setAuthData= useCallback((tokenData:string, refreshToken:string, user:User,isCheck:boolean=true, next:any)=>{
        clearStorage();
        const storage = isCheck ? localStorage : sessionStorage;
        storage.setItem('accessToken', tokenData);
        storage.setItem("refreshToken", refreshToken);
        storage.setItem('user', JSON.stringify(user));
        setToken(tokenData);
        setRefToken(refreshToken)
        setUser(user);
        if(next) next();
    },[]);

    const logout= useCallback(()=>{
        clearStorage();
        setUser(null);
        setToken(null);
        setRefToken(null);
    },[]);

    const isAuthenticated = Boolean(token && user);

    return(
        <AuthContext.Provider value={{user, token, logout, isLoad, isAuthenticated,setAuthData}}>
            {children}
        </AuthContext.Provider>
    )
}
