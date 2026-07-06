import { useCallback } from "react";
import type { ApiReqConfig } from "../utils/types";
import axiosInstance from "./axiosInstance";

export const useApiService = () => {
    const makeReq = useCallback(async(config: ApiReqConfig) => {
        try{
            const res= await axiosInstance({
                method: config.method,
                url: config.url,
                data: config.data,
                params: config.params,
                headers: config.headers,
                timeout: config.timeout,
                signal: config.signal,
            });
            return res.data;
        } catch(err:any){
            if(err.code === "ERR_CANCELED"|| err.name === 'CanceledError' || err.message === "canceled"){
                return;
            }
            const apiErr = {message: err.data?.msg|| err.data?.err|| err.message|| "Request failed",
                            status: err.data?.statusCode|| err.status,
                            data: err.data?.data|| err.data};
            throw apiErr;
        }

    }, []);

    return {makeReq};
}
