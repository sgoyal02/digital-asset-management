import { vi } from "vitest";

export const mockResponse=()=>{
    const res:any = {};
    res.status= vi.fn().mockReturnValue(res);
    res.json= vi.fn().mockReturnValue(res)
    res.send= vi.fn().mockReturnValue(res);
    return res;
}