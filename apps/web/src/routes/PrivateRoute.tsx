import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";


export const PrivateRoute = () => {
    const { isAuthenticated, isLoad } = useAuth();
    if (isLoad) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return isAuthenticated ? <Outlet/> : <Navigate to="/login" replace />;
};