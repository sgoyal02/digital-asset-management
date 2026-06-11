import { useState, useEffect, useCallback, useMemo } from 'react';
import debounce from 'lodash/debounce';
import { useApiService } from '../../services/useApiService';
import type { Asset } from '../../utils/types';
import ErrorMsg from '../../components/ErrorMsg';
import StatusBadge from '../../components/StatusBadge';

const AssetsList = () => {
  const { makeReq } = useApiService();
  const [assets, setAssets] = useState<{data:Asset[], isLoad:boolean, error:string|null}>({data:[], isLoad: false, error:null});
  const [searchTerm, setSearchTerm] = useState('');
  
  const fetchAssets = useCallback(async(search: string = '', signal?:AbortSignal) => {
   setAssets((prev)=>({...prev, isLoad: true, error: null}))
    try {
      const response = await makeReq({
        method: 'GET',
        url: '/assets',
        params:{ search:search||undefined},
        signal
      });
      setAssets((prev)=>({...prev, isLoad: false,
         data: response?.data || response
        }));
    } catch (err: any) {
      console.log("catchEr: ", err);
      // if (err.code === "ERR_CANCELED" ||err.name === "CanceledError") {
      //   return;
      // }
      console.log("afterabo: ", err);
      setAssets((prev)=>({...prev, isLoad: false, data:[]}));
      //  setAssets((prev)=>({...prev, isLoad: false, error: err.message || 'failed fetch assets'}))
    }
  }, [makeReq]);

    useEffect(() => {
    const controller = new AbortController();
    fetchAssets('',controller.signal);
    return(()=>{
      controller.abort();
    })
  }, []);


  const debouncedSearch = useMemo(
  () => debounce((value: string) => {
    fetchAssets(value);
  }, 500),
  [fetchAssets]
);

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  const handleUploadFile= () =>{
  const input = document.createElement("input");
  input.type = "file";
  input.multiple = false;
  input.onchange = async (event:any) => {
    const file = event.target?.files[0];
    if (!file) return;
    await uploadFile(file);
  };
  input.click();
  }

  const uploadFile = async(file:File) => {
    const formData = new FormData();
    formData.append("file", file);
    try{
       const response = await makeReq({
      method:'POST',
      url: `/assets/upload`,
      data: formData,
      headers:{"Content-Type": "multipart/form-data"},
    });
    console.log("res: ", response);
    }catch(err:any){
      console.log("err: ", err);
    }
  }

  return (
    <div className="space-y-5">
        <div>
          <h1 className="text-2xl text-main-white">Assets Overview</h1>
        </div>

        <div className="flex gap-3">
          <div className="relative w-80">
            <input
              type="text"
              placeholder="Search by file name"
              value={searchTerm}
              onChange={(e) => {
                const value = e.target.value;
                setSearchTerm(value);
                debouncedSearch(value);
              }}
              className="w-full bg-card border border-border focus:border-primary-500 rounded-md pl-11 py-3 text-sm text-main-white placeholder:text-muted focus:outline-none"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 absolute left-4 top-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 01-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <button className="bg-primary-500 hover:bg-primary-600 px-2 py-1 hover:cursor-pointer rounded-md 
          font-normal flex items-center gap-1 transition-all active:scale-95"
          onClick={()=>handleUploadFile()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload Asset
          </button>
        </div>

      <ErrorMsg msg={assets.error} />
<div className="bg-card border border-border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-5 text-gray font-medium">Asset</th>
                <th className="text-left p-5 text-gray font-medium">Owner</th>
                <th className="text-left p-5 text-gray font-medium">Type</th>
                <th className="text-left p-5 text-gray font-medium">Size</th>
                <th className="text-left p-5 text-gray font-medium">Status</th>
                <th className="text-left p-5 text-gray font-medium">Upload Date</th>
                <th className="w-20">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {assets.isLoad ? (
                <tr><td colSpan={7} className="p-3 text-left text-gray">Loading assets...</td></tr>
              ) : assets.data?.length === 0 ? (
                <tr><td colSpan={7} className="p-3 text-left text-gray">No assets found</td></tr>
              ) : (
                assets.data?.map((asset) => (
                  <tr key={asset.id} className="hover:bg-hover transition-colors">
                    <td className="p-5">
                          <p className="text-sm text-muted">{asset.fileName}</p>
                    </td>
                    <td className="p-5 text-gray">{asset.owner?.name || '-'}</td>
                    <td className="p-5 text-gray uppercase">{asset.fileType}</td>
                    <td className="p-5 text-gray">
                      {(asset.fileSize/1024/1024).toFixed(2)} MB
                    </td>
                    <td className="p-5">
                      <StatusBadge status={asset.status} />
                    </td>
                    <td className="p-5 text-gray text-sm">
                      {new Date(asset.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="p-5">
                      <button className="text-primary-400 hover:text-primary-300">View</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
};

export default AssetsList;