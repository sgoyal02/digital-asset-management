import { useEffect, useState } from "react";
import { useApiService } from "../services/useApiService";
import type { DashboardStats } from "../utils/types";
import ErrorMsg from "../components/ErrorMsg";

const Dashboard = () => {
    const [stats, setStats] = useState<{isLoad:Boolean, data:DashboardStats|null, errTxt:string}>
                              ({isLoad: false, data:null, errTxt:""});
    const {makeReq}= useApiService();

    useEffect(()=>{
      fetchStats();
    },[]);

    const fetchStats=async () => {
        try {
            setStats(prev => ({ ...prev, isLoad: true, errTxt: ''}));
            const response = await makeReq({method: 'GET', url: '/dashboard/stats'});
            setStats({isLoad: false,data: response.data || response,errTxt: ''});
        } catch (err:any) {
            console.error('dash stats err: ', err);
            if (err.code === "ERR_CANCELED" ||err.name === "CanceledError") {
              return;
            }
            setStats({isLoad: false, data: null, errTxt: err.message|| 'Failed to load assets stats.'});
        }
    };
    
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl text-main-white">Dashboard</h1>
      </div>
      {stats.isLoad ?
      <div className="text-center py-12 text-gray-400">Loading stats...</div>
      : !!stats.errTxt ?
        <ErrorMsg msg={stats.errTxt}/>
      :
      <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* totalData-- */}
        <div className="bg-card border border-border rounded-md p-2 hover:border-success/50 transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-sm">TOTAL ASSETS</p>
              <p className="text-2xl text-success mt-3">{stats.data?.totalAssets}</p>
            </div>
            <div className="w-10 h-10 bg-primary-500/10 rounded-md flex items-center justify-center text-success transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
                </svg>
            </div>
          </div>
        </div>

        {/*--expiring */}
        <div className="bg-card border border-border rounded-md p-2 hover:border-warning/50 transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-sm uppercase">Expiring soon</p>
              <p className="text-2xl text-warning mt-3">{stats.data?.expring}</p>
            </div>
            <div className="w-10 h-10 bg-primary-500/10 rounded-md flex items-center justify-center text-warning transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            </div>
          </div>
        </div>
        {/*--duplicate- */}
        <div className="bg-card border border-border rounded-md p-2 hover:border-info/50 transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-sm uppercase">Duplicates</p>
              <p className="text-2xl text-info mt-3">{stats.data?.dupes}</p>
            </div>
            <div className="w-10 h-10 bg-primary-500/10 rounded-md flex items-center justify-center text-info transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                </svg>
            </div>
          </div>
        </div>
        {/*--risk- */}
        <div className="bg-card border border-border rounded-md p-2 hover:border-error/50 transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-sm uppercase">Risk</p>
              <p className="text-2xl text-error mt-3">{stats.data?.risk}<span className="text-sm">{" assets at risk"}</span></p>
            </div>
            <div className="w-10 h-10 bg-primary-500/10 rounded-md flex items-center justify-center text-error transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
            </svg>

            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* chart-area-- */}
        <div className="lg:col-span-8 bg-card border border-border rounded-md p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Usage Trends</h3>
          </div>
          {/* report --todo */}
        </div>

        {/* process-status-- */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card border border-border rounded-md p-4">
            <h3 className="text-sm font-semibold mb-2">Asset Status</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray">Pending Review</span>
                  <span className="font-medium text-main-white">{stats.data?.processStatus.pendingPer}</span>
                </div>
            <div className="h-2 bg-surface rounded-full overflow-hidden">
            <div className={`h-2 bg-info rounded-full w-${stats.data?.processStatus.pendingPer}`} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray">Failed Assets</span>
                  <span className="font-medium text-main-white">{stats.data?.processStatus.failedPer}</span>
                </div>
                <div className="h-2 bg-surface rounded-full overflow-hidden">
                  <div className={`h-2 bg-error rounded-full w-${stats.data?.processStatus.failedPer ||0}`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      }
    </div>
  );
};

export default Dashboard;