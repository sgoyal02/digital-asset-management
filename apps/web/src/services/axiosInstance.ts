import axios from "axios";
const axiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASEURL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosInstance.interceptors.response.use((response) => response,
    async (error) => {
        const originalReq = error.config;
        const msg = error.response?.data?.message || error.response?.data?.message ||
            error.message || 'Something went wrong. Please try again.';
        if (error.response && error.response.status === 401 && !originalReq._retry) {
            originalReq._retry = true;
            try {
                const newToken = await refreshToken();
                originalReq.headers.Authorization = `Bearer ${newToken}`;
                return axiosInstance(originalReq);
            } catch (err) {
                localStorage.clear();
                sessionStorage.clear();
                window.location.replace("/login");
            }
        }
        return Promise.reject(({
            status: error.response?.status || 500,
            message: msg,
            data: error.response?.data || null,
        }));
    });

const refreshToken = async () => {
    try {
        const refreshToken = localStorage.getItem("refreshToken");
        const res = await axios.post(`${import.meta.env.VITE_API_BASEURL}/api/auth/refresh`, { refreshToken }
        );
        const newToken = res.data.data.accessToken;
        localStorage.setItem("accessToken", newToken);
        return newToken;
    } catch (err) {
        console.error("ref token err: ", err);
        throw err;
    }
};

export default axiosInstance;