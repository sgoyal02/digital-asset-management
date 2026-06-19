import { useCallback, useEffect, useState } from "react";
import { Collection, formatDate } from "../../utils/types";
import { useApiService } from "../../services/useApiService";
import ErrorMsg from "../../components/ErrorMsg";
import { useAuth } from "../../hooks/AuthContext";
import { useNavigate } from "react-router-dom";
import DialogModal from "../../components/DialogModal";

const CollectionsList=() =>{
  const [collections, setCollections] = useState<{data:Collection[], isLoad: boolean, err:string|null}>
                                        ({isLoad: false, err: null, data:[]});
  const [inpData, setInpData] = useState({name:"", desc:"", isShared:false});
  const [state, setState] = useState<{isAdd:boolean, isSubmit: boolean, err:string|null}>
                                      ({isAdd: false, isSubmit: false, err:null});
  const {makeReq} = useApiService();
  const {user}= useAuth();
  const navigate=useNavigate();

  const fetchCollections = useCallback(async(signal?:AbortSignal) => {
    setCollections((prev)=>({...prev, isLoad: true, err:null}));
    try {
      const response = await makeReq({
        method: 'GET',
        url: '/collections',
        signal
      });
      setCollections((prev)=>({...prev, isLoad: false,data: response?.data || response}));
    } catch (err:any) {
      console.error(err);
      setCollections((prev)=>({...prev, isLoad: false, err: err.message || 'failed fetch collection'}))
    }
  }, [makeReq]);

  useEffect(() => {
    const controller = new AbortController();
    fetchCollections(controller.signal);
    return(()=>{
      controller.abort();
    })
  }, []);

  const handleAdd = async () => {
    if (!inpData.name.trim()) {
      setState((prev)=>({...prev, err:'Collection name required'}))
      return;
    }
    setState((prev)=>({...prev, isSubmit: true, err:null}))
    try {
      const res = await makeReq({
        method: 'POST',
        url: '/collections',
        data:inpData
      });
      if(res.success){
        onClose();
        fetchCollections();
      }
    } catch (err: any) {
      setState((prev)=>({...prev, isSubmit: false, err: err.message || 'fail to create'}))
    }
  };

  const onClose=()=>{
    setState((prev)=>({...prev, isAdd: false, isSubmit: false, err:null}));
    setInpData((prev)=>({...prev, isShared: false, name:"", desc:""}));
  }
  const onOpen=(cId:number)=>{
    navigate(`/dashboard/collections/${cId}`);
  }

  const onDelCollection=async(cId:number)=>{
    try{
      const res= await makeReq({
        method:"DELETE",
        url:`/collections/${cId}`
      });
      console.log("res del collction: ", res);
      if(res.success) fetchCollections();
    }catch(err:any){
      console.error(err);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl text-main-white">Collections</h1>
      </div>
      <div>
        <button
          onClick={() =>setState((prev)=>({...prev, isAdd: true}))}
          className="flex items-center gap-1 px-3 py-2 rounded-md bg-primary-700
           hover:bg-primary-600 text-sm text-main-white hover:cursor-pointer">
          <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New collection
        </button>
      </div>

      {collections.isLoad ? (
        <p className="text-muted text-sm">Loading data..</p>
      ) : collections.err ?
      <ErrorMsg msg={collections.err} />
      :collections.data.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-12 text-center">
          <p className="text-muted text-sm">No collections yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.data?.map((c) => (
            <div
              key={c.id}
              onClick={() => onOpen(c.id)}
              className="text-left rounded-md border border-border bg-card p-3 hover:border-primary-500/40 
              transition-colors hover:cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <svg className="w-6 h-6 text-warning" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                </svg>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${c.isShared
                      ? "bg-info/15 text-info border border-info/30"
                      : "bg-secondary-400/30 text-muted border border-secondary-300/20"
                  }`}
                >{c.isShared?"Shared": "Personal"}</span>
              </div>
               <div className="flex justify-between items-center gap-3 mt-5 flex-wrap">
                <div>
              <p className="text-sm text-gray truncate">{c.name}</p>
              <p className="text-xs text-muted mt-1">
                {c._count?.assets ?? 0} asset{c._count?.assets === 1 ? "" : "s"} - {c.createdAt? formatDate(c.createdAt) : ""}
              </p>
              </div>
              {(c.ownerId=== user?.id|| user?.role === "ADMIN") &&
                  <button className="flex-center text-error hover:text-error-light hover:bg-error/10 rounded-md p-1 transition-colors cursor-pointer" 
                  title="Remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelCollection(c.id)}}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>

                  </button>
              }
              </div>
            </div>
          ))}
        </div>
      )}

      {state.isAdd && (
        <DialogModal isOpen={state.isAdd}
        onClose={()=>onClose()}
        isAction
        submitBtn="Create"
        title="New collection"
        onSubmit={()=>handleAdd()}
        children={
          <div className="space-y-3">
              {state.err && <p className="text-error text-xs">{state.err}</p>}
              <input required
                value={inpData.name}
                onChange={(e) =>{
                  setInpData((prev)=>({...prev, name:(e.target.value)}));
                  setState((prev)=>({...prev, err:null}))
                  }
                }
                placeholder="Collection name"
                className="w-full bg-secondary-700/50 border border-border focus:border-border-focus focus:ring-1 focus:ring-focus-ring rounded-md px-3 py-2 text-sm text-gray placeholder:text-muted outline-none"
              />
              <textarea
                value={inpData.desc}
                onChange={(e) =>setInpData((prev)=>({...prev, desc:(e.target.value)}))}
                placeholder="Description"
                rows={2}
                className="w-full bg-secondary-700/50 border border-border focus:border-border-focus focus:ring-1 focus:ring-focus-ring rounded-md px-3 py-2 text-sm text-gray placeholder:text-muted outline-none resize-none"
              />
              {(user?.role!=="USER") && (
                <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inpData.isShared}
                    onChange={(e) =>setInpData((prev)=>({...prev, isShared:(e.target.checked)}))}
                    className="w-4 h-4"
                  />
                  Share in team
                </label>
              )}
            </div>
        }
        />
      )}
    </div>
  );
}

export default CollectionsList;