import { Route, Routes } from "react-router-dom";
import Login from "../pages/Login";
import { PrivateRoute } from "./PrivateRoute";
import Redirect from "./Redirect";
import { lazy, Suspense } from "react";
import PageLoader from "../components/PageLoader";
import DashboardLayout from "../components/layout/DashboardLayout";

const Dashboard = lazy(() => import("../pages/Dashboard"));
const AssetsOverview = lazy(() => import("../pages/AssetsOverview"));
const Collections = lazy(() => import("../pages/Collections"));
const Reports = lazy(() => import("../pages/Reports"));
const BackgroundJobs = lazy(() => import("../modules/jobs_admin"));
const AssetDetail = lazy(() => import("../modules/assets/AssetDetail"));
const CollectionDetail = lazy(() => import("../modules/collections/CollectionDetail"));


export default function AppRoutes () {
    return(
        <Suspense fallback={<PageLoader />}>
            <Routes>
                <Route path="/" element={<Redirect />} />
                <Route path={'/login'} element={<Login/>}/>
                <Route element={<PrivateRoute/>}>
                    <Route path={'/dashboard'} element={<DashboardLayout/>}>
                        <Route index element={<Dashboard/>}/>
                        <Route path={'assets'} element={<AssetsOverview/>}/>
                        <Route path={'assets/:id'} element={<AssetDetail/>}/>
                        <Route path={'collections'} element={<Collections/>}/>
                         <Route path={'collections/:id'} element={<CollectionDetail/>}/>
                         <Route path="collections/:collectionId/assets/:id" element={<AssetDetail />}/>
                         <Route path={"reports"} element={<Reports />}/>
                         <Route path={"jobs"} element={<BackgroundJobs />}/>
                    </Route>
                </Route>
            </Routes>
            </Suspense>
    )
}