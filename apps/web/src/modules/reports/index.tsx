import { useState, useEffect, useCallback } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { useApiService } from '../../services/useApiService';
import ErrorMsg from '../../components/ErrorMsg';
import { STATUS_COLORS, TYPE_COLORS } from '../../utils/helpers';

const ReportsPage = () => {
  const { makeReq } = useApiService();
  const [filters, setFilters] = useState({time:7, type:'A', dept:'-1'})
  const [reportData, setReportData]=useState<{usage:any, compliance:any, dupes:any, isLoad:boolean, errC:string|null, errD:string|null, errU:string|null, err:string|null}>
  ({usage:null, compliance:null, dupes:null, isLoad: false, errU:null, errC:null, errD:null, err:null})
  
  const TIME_OPTIONS= [{ label:'Last 7D', value:7 }, { label:'Last 30D', value:30 },
    { label:'Last 60D', value:60 }, { label:'Last 90D', value:90 }];

  const ASSET_TYPES= [{ label:'All', value:'A' }, { label:'Image', value:'I' },
    { label:'Video', value:'V' }, { label:'Audio', value:'AU' }, {label:'Document', value:'D'}]


  const fetchReports = useCallback(async(f=filters) => {
  setReportData((prev)=>({...prev, isLoad: true, errC:null, errD:null, errU:null, err:null}))
  console.log("fil pay: ", f);
  try{
  const[u,c,d]= await Promise.allSettled([
    makeReq({method: 'GET',url:'/reports/usage', params:{days:f.time, type:f.type, dept: f.dept}}),
    makeReq({method: 'GET',url:'/reports/compliance', params:{days:f.time, type:f.type, dept: f.dept}}),
    makeReq({method: 'GET',url:'/reports/duplication' , params:{days:f.time, type:f.type, dept: f.dept}}),
  ]);
  console.log("ucd report: ", u,c,d);
  setReportData((prev)=>({...prev,
    usage:u.status=== 'fulfilled'? u.value?.data.data : null,
    compliance:c.status=== 'fulfilled'? c.value?.data.data : null,
    dupes:d.status=== 'fulfilled'? d.value?.data.data : null,
    errU:u.status=== 'rejected'? 'failed to load usage data': null,
    errD:d.status=== 'rejected'? 'failed to load dupes data': null,
    errC:c.status=== 'rejected'? 'failed to load compliance data': null,
  }))
  }catch(err:any){
    setReportData((prev)=>({...prev, err:err.mesage}))
  }finally{
    setReportData((prev)=>({...prev, isLoad: false}))
  }
}, [makeReq]);

  useEffect(() => {
    fetchReports(filters);
  }, [fetchReports]);
console.log("rep: ", reportData);


  const typeData= reportData.usage?.byType?.map((item:{name:string, count:string}) => ({
    ...item, fill: TYPE_COLORS[item.name]|| "var(--color-secondary-300)"
  }));
  const statusData=reportData.usage?.byStatus?.map((item:{name:string, count:string}) => ({
    ...item, fill: STATUS_COLORS[item.name]|| "var(--color-secondary-300)"
  }));
  const complianceData=reportData.compliance?.map((item:{name:string, count:string}) => ({
    ...item, fill: STATUS_COLORS[item.name]|| "var(--color-secondary-300)"
  }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl text-main-white">Assets Reports</h1>
      </div>
      {/* filters */}
      <div className="bg-card border border-border rounded-md p-3 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-gray mb-2">Time Range</label>
          <select value={filters.time} onChange={(e) => setFilters((prev)=>({...prev, time:Number(e.target.value)}))}
          className="bg-surface border border-border rounded-md p-2 text-sm 
          focus:outline-none focus:border-primary-500"
          >{TIME_OPTIONS.map((range) => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray mb-2">Asset type</label>
          <select value={filters.type} onChange={(e)=> setFilters((prev)=>({...prev, type:e.target.value}))}
            className="bg-surface border border-border rounded-md p-2
            text-sm focus:outline-none focus:border-primary-500"
          >{ASSET_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray mb-2">Department</label>
          <select value={filters.dept} onChange={(e)=> setFilters((prev)=>({...prev, dept:e.target.value}))}
            className="bg-surface border border-border rounded-md p-2 
            text-sm focus:outline-none focus:border-primary-500"
          >
            <option value="-1">All Departments</option> {/* do for dept typ */}
          </select>
        </div>

        <button onClick={()=>fetchReports(filters)} disabled={reportData.isLoad}
          className="ml-auto bg-primary-500 hover:bg-primary-600 hover:cursor-pointer 
          px-4 py-2 rounded-md transition-all disabled:opacity-40"
        > {'Run reports'}
        </button>
      </div>
      {reportData.err ? <ErrorMsg msg={reportData.err}/>
      :
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/*for usage- */}
        <div className="bg-card border border-border rounded-md p-4">
          <h2 className="text-sm font-semibold text-gray mb-2">Usage Trends</h2>
           {reportData.isLoad ?
            <div className="h-52 flex items-center justify-center text-muted text-sm">Loading..</div>
           : reportData.errU ?
           <div className="h-52 flex items-center justify-center text-muted text-sm">
            <ErrorMsg msg={reportData.errU} />
            </div>
          : !reportData.usage?
          <div className="h-52 flex items-center justify-center text-muted text-sm">
              No uploads</div>
          :
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={reportData.usage?.calUploads||[]}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(188,173,225,0.08)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgba(226,232,240,0.65)' }}
                tickFormatter={(val) => {
                            const d = new Date(val);
                            return `${d.getDate()}/${d.getMonth() + 1}`;
                }}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'rgba(226,232,240,0.65)' }} />
              <Tooltip labelFormatter={(val) => new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
               formatter={(value: any) => [value, 'Uploads']}
              contentStyle={{ background: '#1a1d2b', border: '1px solid rgba(188,173,225,0.2)', borderRadius: '8px' }} />
              <Bar dataKey="count" fill="#9d82d0" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          }
        </div>
           {/*for compliance- */}
        <div className="bg-card border border-border rounded-md p-4">
          <h2 className="text-sm font-semibold text-gray mb-2">Compliance</h2>
          {reportData.isLoad ?
            <div className="h-52 flex items-center justify-center text-muted text-sm">Loading..</div>
           : !!reportData.errC ?
           <div className="h-52 flex items-center justify-center text-muted text-sm">
            <ErrorMsg msg={reportData.errC} />
            </div>
          : !reportData.compliance?
          <div className="h-52 flex items-center justify-center text-muted text-sm">
              No uploads</div>
          :
          <div className='flex flex-col lg:flex-row items-center gap-8'>
            <div className="shrink-0 w-full lg:w-1/2">
           <ResponsiveContainer width={"100%"} height={200}>
        <PieChart>
        <Pie data={complianceData}
          dataKey="count" nameKey="name" cx={"50%"} cy={"50%"}
          outerRadius={70} innerRadius={40}
        />
        <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      </div>
      <div className="w-full lg:w-1/2 space-y-3">
            {(reportData.compliance||[])?.map((item:any) => {
              const color= STATUS_COLORS[item.name]|| "var(--color-secondary-400)"
              return(
              <div key={item.name} className="flex items-center justify-start">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }}/>
                  <span className="text-gray text-sm">{item.name}:</span>
                </div>
                <span className="text-sm text-main-white">{item.count}</span>
              </div>
            )})}
        </div>
        </div>
      }
       </div>
        
        {/*for file type n status- */}
          <div className="bg-card border border-border rounded-md p-4">
          <h2 className="text-sm font-semibold text-gray mb-2">Types stats</h2>
           {reportData.isLoad ?
            <div className="h-40 flex items-center justify-center text-muted text-sm">Loading..</div>
           : reportData.errU ?
           <div className="h-40 flex items-center justify-center text-muted text-sm">
            <ErrorMsg msg={reportData.errU} />
            </div>
          : !reportData.usage?
          <div className="h-40 flex items-center justify-center text-muted text-sm">
              No uploads</div>
          :
          <div className='flex flex-col lg:flex-row items-center gap-8'>
            <div className="shrink-0 w-full lg:w-1/2">
        <ResponsiveContainer width={"100%"} height={200}>
        <PieChart>
        <Pie data={typeData}
          dataKey="count" nameKey="name" cx={"50%"} cy={"50%"}
          outerRadius={70} innerRadius={40}
        />
        <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      </div>
      <div className="w-full lg:w-1/2 space-y-3">
        {(reportData.usage?.byType||[])?.map((item:any) => {
        const color= TYPE_COLORS[item.name]|| "var(--color-secondary-400)"
          return(
            <div key={item.name} className="flex items-center justify-start">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }}/>
                  <span className="text-gray text-sm">{item.name}:</span>
                </div>
                <span className="text-sm text-main-white">{item.count}</span>
            </div>
            )})}
        </div>
      </div>
      }
      </div>
      
     <div className="bg-card border border-border rounded-md p-4">
          <h2 className="text-sm font-semibold text-gray mb-2">Status stats</h2>
           {reportData.isLoad ?
            <div className="h-40 flex items-center justify-center text-muted text-sm">Loading..</div>
           : reportData.errU ?
           <div className="h-40 flex items-center justify-center text-muted text-sm">
            <ErrorMsg msg={reportData.errU} />
            </div>
          : !reportData.usage?
          <div className="h-40 flex items-center justify-center text-muted text-sm">
              No uploads</div>
          :
          <div className='flex flex-col lg:flex-row items-center gap-8'>
            <div className="shrink-0 w-full lg:w-1/2">
        <ResponsiveContainer width={"100%"} height={200}>
        <PieChart>
        <Pie data={statusData}
          dataKey="count" nameKey="name" cx={"50%"} cy={"50%"}
          outerRadius={70} innerRadius={40}
        />
        <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      </div>
      <div className="w-full lg:w-1/2 space-y-3">
            {(reportData.usage?.byStatus||[])?.map((item:any) => {
              const color= STATUS_COLORS[item.name]|| "var(--color-secondary-400)"
              return(
              <div key={item.name} className="flex items-center justify-start">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }}/>
                  <span className="text-gray text-sm">{item.name}:</span>
                </div>
                <span className="text-sm text-main-white">{item.count}</span>
              </div>
            )})}
        </div>
      </div>
      }
      </div>

          {/*for dupes-- */}
        <div className="lg:col-span-2 bg-card border border-border rounded-md p-4">
          <h2 className="text-sm font-semibold text-gray mb-2">Duplicate stat</h2>
          {reportData.isLoad ?
            <div className="flex items-center justify-center text-muted text-sm">Loading..</div>
           : !!reportData.errD ?
            <ErrorMsg msg={reportData.errD} />
          : !reportData.dupes?
          <div className="flex items-center justify-center text-muted text-sm">
              No uploads</div>
          :
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-wrap items-center gap-3 justify-center bg-surface rounded-md p-2 text-center">
              <p className="text-xl text-error">{reportData.dupes?.duplication?.[0]?.count|| 0}</p>
              <p className="text-md text-gray">Duplicates</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 justify-center bg-surface rounded-md p-2 text-center">
              <p className="text-xl text-success">{reportData.dupes?.duplication?.[1]?.count|| 0}</p>
              <p className="text-sm text-gray">Clean asset(s)</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 justify-center bg-surface rounded-md p-2 text-center">
              <p className="text-xl text-primary-400">{reportData.dupes?.storageDupe || '0.00'} MB</p>
              <p className="text-sm text-gray">Wasted space</p>
            </div>
          </div>
          }
        </div>
      </div>
      }
    </div>
  );
};

export default ReportsPage;