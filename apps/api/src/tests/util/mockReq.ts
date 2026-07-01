
export const mockReq=(data= {})=> {
    return {body: {}, params: {},
        query: {},
        headers: {},
        user: {},
        ...data
    };
}