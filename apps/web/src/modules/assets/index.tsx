import { useState, useEffect, useCallback, useMemo } from 'react';
import debounce from 'lodash/debounce';
import { useApiService } from '../../services/useApiService';
import { Collection, formatDate, type Asset } from '../../utils/types';
import ErrorMsg from '../../components/ErrorMsg';
import StatusBadge from '../../components/StatusBadge';
import { useNavigate } from 'react-router-dom';
import DialogModal from '../../components/DialogModal';

const AssetsList = () => {
  const { makeReq } = useApiService();
  const [assets, setAssets] = useState<{data:Asset[], isLoad:boolean, error:string|null}>({data:[], isLoad: false, error:null});
  const [searchTerm, setSearchTerm] = useState('');
  const navigate= useNavigate();
  const [selectedIds, setSelectedIds]= useState<{aIds:Set<number>, isSubmit:boolean, 
    destCols:Collection[], isAdd: boolean, cId:number|null, err:string|null}>
  ({aIds:new Set(), isSubmit: false, destCols:[], isAdd: false, cId:null, err:null});
  
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
      console.log("afterabort: ", err);
       setAssets((prev)=>({...prev, isLoad: false, error: err.message || 'failed fetch assets'}))
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
    } finally{
      fetchAssets();
    }
  }

  const handleAdd=async()=>{
    setSelectedIds((prev)=>({...prev, isAdd: true,cId:null}));
    try {
      const res = await makeReq({
        method:"GET",
        url:'/collections',
      });
      if(res.success)
        setSelectedIds((prev)=>({...prev, destCols: res.data }));
    } catch (err) {
      console.error(err);
    }
  }

  const onAddToCollection=async()=>{
    console.log("sle asse: ", selectedIds.aIds, Array.from(selectedIds.aIds), selectedIds);
    if(!selectedIds.cId) return;
    try{
      const response = await makeReq({
      method:'POST',
      url:`/collections/${selectedIds.cId}/assets`,
      data:{assetIds:Array.from(selectedIds.aIds)}
    });
    console.log("res: ", response);
    if(response.success){
      setSelectedIds((prev)=>({...prev, aIds:new Set(), err:null}));
      fetchAssets();
    }
    }catch(err:any){
      console.log("err: ", err);
      setSelectedIds((prev)=>({...prev, err: err.message|| 'fail to add to col'}));
    } finally{
      setSelectedIds((prev)=>({...prev, isSubmit: false, isAdd: false, cId:null}));
    }
  }

 const onSelectAsset=(id:number) => { 
  setSelectedIds(prev => {
  const newIds= new Set(prev.aIds);
  newIds.has(id)? newIds.delete(id) : newIds.add(id);
  return {...prev, aIds:newIds};
  });
};

 const onSelectAll = () => {
  const allIds=assets.data?.map(a=>a.id)||[];
  setSelectedIds(prev => {
    const newIds:Set<number>= prev.aIds.size=== allIds.length?new Set(): new Set(allIds);
    return {...prev, aIds:newIds};
  });
};

useEffect(()=>{
  setTimeout(()=>{
    setAssets((prev)=>({...prev, error:null}));
    setSelectedIds((prev)=>({...prev, err:null}))
  },3000);
},[assets.error || selectedIds.err]);

  return (

    <div className="space-y-5">
        <div>
          <h1 className="text-2xl text-main-white">Assets Overview</h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search by asset name"
              value={searchTerm}
              onChange={(e) => {
                const value = e.target.value;
                setSearchTerm(value);
                debouncedSearch(value);
              }}
              className="w-full bg-card border border-border focus:border-primary-500 rounded-md pl-11 py-2 text-sm text-main-white placeholder:text-muted focus:outline-none"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 absolute left-4 top-2.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 01-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <button className="bg-primary-500 hover:bg-primary-600 px-3 py-2 hover:cursor-pointer rounded-md 
          font-normal flex items-center gap-1 transition-all active:scale-95 whitespace-nowrap text-sm"
          onClick={()=>handleUploadFile()}
          >
          <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>

            Upload Asset
          </button>
           <button className="bg-primary-500 hover:bg-primary-600 px-3 py-2 hover:cursor-pointer rounded-md 
          font-normal flex items-center gap-1 transition-all active:scale-95 whitespace-nowrap text-sm
          disabled:bg-secondary-400 disabled:text-muted disabled:cursor-not-allowed"
          onClick={()=>handleAdd()}
          disabled={selectedIds.aIds.size=== 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add to Collection
          </button>
        </div>

      <ErrorMsg msg={assets.error || selectedIds.err} />
      <div className="bg-card border border-border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-border">
                <th className="p-5 w-10">
                  <input className='hover:cursor-pointer' type="checkbox" onChange={onSelectAll}
                    checked={assets.data?.length > 0 && selectedIds.aIds.size=== assets.data.length}
                    ref={el=>{
                      if (el)
                      el.indeterminate=(selectedIds.aIds.size>0 && selectedIds.aIds.size<(assets.data?.length||0))
                    }}
                  />
                </th>
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
                <tr><td colSpan={8} className="p-3 text-left text-gray">Loading assets...</td></tr>
              ) : assets.data?.length === 0 ? (
                <tr><td colSpan={8} className="p-3 text-left text-gray">No assets found</td></tr>
              ) : (
                assets.data?.map((asset) => (
                  <tr key={asset.id} className="hover:bg-hover transition-colors">
                    <td className="p-5">
                      <input className='hover:cursor-pointer' type="checkbox" checked={selectedIds.aIds.has(asset.id)}
                        onChange={()=>onSelectAsset(asset.id)}/>
                    </td>
                    <td className="p-5 max-w-xs">
                          <p className="text-sm text-muted break-all">{asset.fileName}</p>
                    </td>
                    <td className="p-5 text-gray">{asset.owner?.name || '-'}</td>
                    <td className="p-5 text-gray">{asset.mimeType}</td>
                    <td className="p-5 text-gray">
                      {(asset.size/1024/1024).toFixed(2)} MB
                    </td>
                    <td className="p-5">
                      <StatusBadge status={asset.status} />
                    </td>
                    <td className="p-5 text-gray text-sm">
                      {asset.createdAt ? formatDate(asset.createdAt) : ""}
                    </td>
                    <td className="p-5">
                      <button className="text-primary-400 hover:cursor-pointer hover:text-primary-300"
                      onClick={() => navigate(`/dashboard/assets/${asset.id}`)}
                      >View</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {selectedIds.isAdd&&(
        <DialogModal isOpen={selectedIds.isAdd}
        onClose={()=>setSelectedIds((prev)=>({...prev,isSubmit: false,cId:null, isAdd: false}))}
        title={'Add to Collection'}
        onSubmit={()=>onAddToCollection()}
        children={!selectedIds.destCols.length?(
              <p className="text-muted text-sm py-4 text-center">
                No other collections avail</p>
            ):(
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {selectedIds.destCols?.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-secondary-700/40 hover:bg-secondary-600/40 text-sm text-gray transition-colors cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="targetCollection"
                      value={c.id}
                      checked={selectedIds.cId === c.id}
                      onChange={() => setSelectedIds((prev)=>({...prev, cId:c.id}))}
                      className="w-4 h-4 accent-primary-500 cursor-pointer"
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            )}
        isAction
        submitBtn={"Add"}
        />
      )
    }
    </div>
  );
};

export default AssetsList;