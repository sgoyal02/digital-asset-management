import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";

export default function Redirect(){
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};