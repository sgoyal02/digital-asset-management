import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BackJobs, formatFulltDate } from "../../utils/types";
import { useApiService } from "../../services/useApiService";
import { JOB_STATUS_STYLE, JOB_TYPE_LABEL } from "../../utils/helpers";


const BackgroundJobs = () => {
  const [jobs, setJobs] = useState<{ isLoad: boolean, data: BackJobs[] | null, errTxt: string | null, lastRun: Date | null }>
    ({ isLoad: false, data: null, errTxt: null, lastRun: null });
  const { makeReq } = useApiService();
  const POLL_IDLE = 10000;
  const POLL_RUN = 4000;
  const jobHeaders: { id: keyof BackJobs; label: string }[] = [
    { id: "type", label: 'Job Type' },
    { id: "assetName", label: 'Asset' },
    { id: "status", label: 'Status' },
    { id: "startedAt", label: 'Started' },
    { id: "duration", label: 'Duration' },
    { id: "completedAt", label: 'Completed' },
    { id: "err", label: 'Error' }
  ]
  const verRef = useRef<number>(0);
  const mountRef = useRef<boolean | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchBackJobs = useCallback(async () => {
    setJobs((prev) => ({ ...prev, isLoad: true, errTxt: null }));
    try {
      const res = await makeReq({ method: "GET", url: "/jobs?limit=30" });
      if (!mountRef.current) return;
      if (res.data.lastUpdated === verRef.current) return;

      verRef.current = res.data.lastUpdated;
      setJobs((prev) => ({
        ...prev, data: res.data?.data || null, lastRun: new Date()
      }));
    } catch (err: unknown) {
      if (!mountRef.current)
        return;
      console.error("job err:", err);
      const errMsg = err as { data: {message:string, statusCode?:number}};
      setJobs((prev) => ({ ...prev, errTxt: errMsg.data.message || 'failed to fetch jobs' }));
    } finally {
      setJobs((prev) => ({ ...prev, isLoad: false }));
    }
  }, [makeReq]);


  const hasCurrRun = useMemo(() => {
    return jobs.data?.some((j) => j.status === "RUNNING") ?? false;
  }, [jobs.data]);

  useEffect(() => {
    const fetchData=async()=>{
      try{
        await fetchBackJobs();
      }catch(err:unknown){
        console.error(err);
        const errMsg = err as { data: {message:string, statusCode?:number}};
        setJobs((prev) => ({ ...prev, errTxt: errMsg.data.message || 'failed to fetch back jobs.' }));
      }
    }
    fetchData();
  }, [fetchBackJobs]);

  useEffect(() => {
    mountRef.current = true;
    return () => {
      mountRef.current = false;
    };
  }, []);

  useEffect(() => {
    const startPoll = () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
      pollRef.current = setInterval(() => {
        fetchBackJobs();
      }, hasCurrRun ? POLL_RUN : POLL_IDLE);
    }
    startPoll();

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }
  }, [hasCurrRun, fetchBackJobs]);


  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl text-main-white">Background Processing</h1>
          <p className="flex items-center gap-2 mt-2 text-sm text-muted">
            {hasCurrRun && (
              <span className="inline-flex items-center gap-1.5 text-info">
                <span className="w-1.5 h-1.5 rounded-full bg-info animate-pulse" />
                Jobs running
              </span>
            )}
            {!hasCurrRun && jobs.lastRun && (
              <span>Last updated {formatFulltDate(jobs.lastRun.toISOString())}</span>
            )}
          </p>
        </div>
        <button onClick={() => fetchBackJobs()}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted 
        hover:text-main-white hover:bg-hover hover:cursor-pointer transition-colors">
          <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Refresh
        </button>
      </div>
      <div className="bg-card border border-border rounded-md overflow-hidden">
        <div className="max-h-[70vh] overflow-auto border border-border">
          <table className="w-full min-w-[900px]">
            <thead className="sticky top-0 bg-base z-10">
              <tr className="border-b border-border">
                {jobHeaders.map((j, idx) => (
                  <th className={`text-left p-5 text-gray font-medium w-[${idx === 6 ? 20 : 'w-fit'}]`}>{j.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {jobs.isLoad ? (
                <tr><td colSpan={7} className="p-3 text-left text-gray">Loading jobs...</td></tr>
              ) : jobs.errTxt ? (
                <tr><td colSpan={7} className="p-3 text-left text-error">{jobs.errTxt}</td></tr>
              ) : jobs.data?.length === 0 ? (
                <tr><td colSpan={7} className="p-3 text-left text-gray">{"No jobs found"}</td></tr>
              ) : (
                jobs.data?.map((ele: BackJobs) => (
                  <tr key={ele.id} className="hover:bg-hover transition-colors">
                    {jobHeaders.map((col, idx) => {
                      const val = ele[col.id] ?? "";
                      return (
                        <td className={`p-5 ${idx === 6 && !!ele.err ? 'text-error' : 'text-gray'}`}>
                          {idx === 0 ? JOB_TYPE_LABEL[val]
                            : idx === 2 ?
                              <span className={` inline-block px-2 py-1 rounded-full 
                            text-xs font-medium ${JOB_STATUS_STYLE[val]}`}>
                                {val}</span>
                              : idx === 3 || idx === 5 ? (val ? formatFulltDate(String(val)) : "")
                                : (val ?? "-")
                          }
                        </td>
                      )
                    })}
                  </tr>
                )))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default BackgroundJobs;