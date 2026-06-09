import axios from "axios";
const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASEURL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config)=>{
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosInstance.interceptors.response.use((response) => response,
(error) => {
    const msg= error.response?.data?.message || error.response?.data?.message ||
                error.message || 'Something went wrong. Please try again.';
    if (error.response && error.response.status === 401) {  
        localStorage.clear();
        // window.location.href = '/login';
    }
    return Promise.reject(({
        status: error.response?.status || 500,
        message: msg,
        data: error.response?.data || null,
    }));
});

export default axiosInstance;