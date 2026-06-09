import { Route, Routes } from "react-router-dom";
import Login from "../pages/Login";
import { PrivateRoute } from "./PrivateRoute";
import Dashboard from "../pages/Dashboard";
import Redirect from "./Redirect";
import DashboardLayout from "../components/layout/DashboardLayout";


export default function AppRoutes () {
    return(
            <Routes>
                <Route path="/" element={<Redirect />} />
                <Route path={'/login'} element={<Login/>}/>
                <Route element={<PrivateRoute/>}>
                    <Route path={'/dashboard'} element={<DashboardLayout/>}>
                        <Route index element={<Dashboard/>}/>
                    </Route>
                </Route>
            </Routes>
    )
}