import { useCallback, useRef } from "react";
import type { ApiReqConfig } from "../utils/types";
import axiosInstance from "./axiosInstance";

export const useApiService = () => {
    const abortController = useRef<AbortController | null>(null);
    const cancelReq = useCallback(() => {
        if (abortController.current) {
            abortController.current.abort();
            abortController.current = null;
        }
    }, []);

    const makeReq = useCallback(async(config: ApiReqConfig) => {
        cancelReq();  //to cancel prev req pending
        abortController.current = new AbortController();
        try{
            const res= await axiosInstance({
                method: config.method,
                url: config.url,
                data: config.data,
                params: config.params,
                headers: config.headers,
                timeout: config.timeout,
                signal: abortController.current.signal,
            });
            return res.data;
            // return res.data?.data ?? res.data;  //check fist back res
        } catch(err:any){
            if(err.name === 'CanceledError'){
                throw new Error('Request cancelled');
            }
            const apiErr = {message: err.data?.msg|| err.data?.err|| err.message,
                            status: err.data?.statusCode|| err.status,
                            data: err.data?.data|| err.data};
            throw apiErr;
        }

    }, [cancelReq]);

    useCallback(() => {
        return () =>cancelReq();
    }, [cancelReq]);

    return {makeReq, cancelReq};
}
