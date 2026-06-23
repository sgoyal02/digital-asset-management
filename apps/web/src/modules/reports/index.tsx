import { useState, useEffect, useCallback } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { useApiService } from '../../services/useApiService';
import ErrorMsg from '../../components/ErrorMsg';

const TIME_RANGE= [{ label:'Last 7D', value:7 },
  { label:'Last 30D', value:30 },
  { label:'Last 60D', value:60 },
  { label:'Last 90D', value:90 },
];

const ASSET_TYPES= ['All', 'Image', 'Video', 'Audio', 'Document'];

const ReportsPage = () => {
  const { makeReq } = useApiService();
  const [timeRange, setTimeRange] = useState(30);
  const [assetType, setAssetType] = useState('All');
  const [department, setDepartment] = useState('All');
  const [usageData, setUsageData] = useState<any>(null);
  const [complianceData, setComplianceData] = useState<any>(null);
  const [duplicationData, setDuplicationData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({time:30, type:'All', dept:'All'}) //to fix

  const fetchReports = useCallback(async () => {
    //to do
  }, [timeRange]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <div className="space-y-5">
        <div>
          <h1 className="text-2xl text-main-white">Assets Reports</h1>
        </div>

      {/* filters */}
      <div className="bg-card border border-border rounded-md p-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-gray mb-2">TIME RANGE</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="bg-surface border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:border-primary-500"
          >
            {TIME_RANGE.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray mb-2">ASSET TYPE</label>
          <select
            value={assetType}
            onChange={(e) => setAssetType(e.target.value)}
            className="bg-surface border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:border-primary-500"
          >
            {ASSET_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* depfilter--*/}
        <div>
          <label className="block text-xs font-medium text-gray mb-2">DEPARTMENT</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="bg-surface border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:border-primary-500"
          >
            <option value="All">All Departments</option>
          </select>
        </div>

        <button
          onClick={fetchReports}
          disabled={loading}
          className="ml-auto bg-primary-500 hover:bg-primary-600 
          px-6 py-3 rounded-md font-medium transition-all disabled:opacity-70"
        > {loading ? 'fethcing' : 'run reports'}
        </button>
      </div>

      <ErrorMsg msg={error} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-md p-6">
          <h2 className="text-sm font-semibold text-gray mb-2">Usage Trends</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={usageData?.calUploads || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(188,173,225,0.08)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: 'rgba(226,232,240,0.65)' }}
                tickFormatter={(val) => new Date(val).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'rgba(226,232,240,0.65)' }} />
              <Tooltip contentStyle={{ background: '#1a1d2b', border: '1px solid rgba(188,173,225,0.2)', borderRadius: '8px' }} />
              <Bar dataKey="count" fill="#9d82d0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-md p-6">
          <h2 className="text-sm font-semibold text-gray mb-2">Compliance</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={complianceData?.compliance || []}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                dataKey="count"
                nameKey="name"
              >
                {complianceData?.compliance?.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={['#22c55e', '#60a5fa', '#ef4444', '#8b5cf6', '#f59e0b'][index % 5]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            {complianceData?.compliance?.map((item: any) => (
              <div key={item.name} className="flex justify-between bg-surface rounded-md px-4 py-3">
                <span className="text-gray">{item.name}</span>
                <span className="font-medium text-main-white">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-card border border-border rounded-md p-6">
          <h2 className="text-sm font-semibold text-gray mb-2">Duplicate analysis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface rounded-md p-3 text-center">
              <p className="text-5xl font-semibold text-error mb-2">{duplicationData?.duplication?.[0]?.count || 0}</p>
              <p className="text-gray">dupes</p>
            </div>
            <div className="bg-surface rounded-md p-3 text-center">
              <p className="text-5xl font-semibold text-success mb-2">{duplicationData?.duplication?.[1]?.count || 0}</p>
              <p className="text-gray">clean asset</p>
            </div>
            <div className="bg-surface rounded-md p-3 text-center">
              <p className="text-5xl font-semibold text-primary-400 mb-2">{duplicationData?.storageDupe || '0.00'} MB</p>
              <p className="text-gray">waste space</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;