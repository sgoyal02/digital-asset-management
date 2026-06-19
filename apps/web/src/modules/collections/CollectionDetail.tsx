import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Collection, CollectionAsset, CollectionDetail, ModalMode } from "../../utils/types";
import { useApiService } from "../../services/useApiService";
import ErrorMsg from "../../components/ErrorMsg";
import DialogModal from "../../components/DialogModal";

const CollectionDetail=() =>{
  const param= useParams();
  console.log("id: ", param.id);
  const [collection, setCollection]= useState<{isLoad:boolean, err: string|null, cData:CollectionDetail|null, assets:CollectionAsset[], itemLoad:boolean}>
  ({isLoad: false, cData:null, assets:[], err:null, itemLoad:false});
  const [modal, setModal] = useState<{state:ModalMode, isSubmit: boolean}>({state:null, isSubmit:false});
  const {makeReq} = useApiService();
  const navigate= useNavigate();
  const [destCols, setDestCols] = useState<Collection[]>([]);

  const getDetail = async () => {
    setCollection((prev)=>({...prev, isLoad: true, err:null}));
    try {
      const res = await makeReq({
        method: 'GET',
        url: `/collections/${param.id}`
      });
      console.log("ui res detail: ", res);
      setCollection((prev)=>({...prev, isLoad: false, cData: res.data?.cData, assets: res.data?.assetsData}));
    } catch(err:any) {
      setCollection((prev)=>({...prev, isLoad: false, err:err.message}));
    }
  };

  useEffect(() => {
    getDetail();
  }, [param.id]);


  const onBack=()=>{
    navigate('/dashboard/collections');
  }
  const onOpenAsset=(aId:number)=>{
    navigate(`/dashboard/collections/${param.id}/assets/${aId}`);
  }

  const handleModal=async (type:"move"|"copy", aId:number)=>{
    setModal((prev)=>({...prev, state:{type, assetId:aId, cId:null}}))
    try {
      const res = await makeReq({
        method:"GET",
        url:'/collections',
        params:{exclude:param.id}
      });
      if(res.success)
        setDestCols(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const onDelAsset=async(assetId:number)=>{
    setCollection((prev)=>({...prev, itemLoad: true}));
    try{
      const res= await makeReq({
        method:"DELETE",
        url:`/collections/${param.id}/assets/${assetId}`
      })
      console.log("Res aId del: ", res);
    }catch(err:any){
      console.error(err);
    }finally{
      setCollection((prev)=>({...prev, itemLoad: false}));
    }
  }

  const onAssetAction=async()=>{
    setModal((prev)=>({...prev, isSubmit: true}));
    try{
      const res= await makeReq({
        method: modal.state?.type === "move" ? "PATCH" : "POST",
        url: modal.state?.type === "move" ? 
              `/collections/${param.id}/assets/${modal.state.assetId}/move`
              : `/collections/${modal.state?.cId}/assets`,
        data:modal.state?.type==="move" ? {destId:modal.state.cId} : {assetIds:[modal.state?.assetId]},
      });
      console.log("res asset action: ", res);
      setModal((prev)=>({...prev, state:null}));
      if(modal.state?.type === "move") getDetail();
    }catch(err:any){
      console.error(err);
    }finally{
      setModal((prev)=>({...prev, isSubmit: false}));
    }
  }

  return (
    <div className="bg-base text-main-white px-6 py-8 max-w-6xl mx-auto">
    {collection.isLoad ?
     <div className="bg-base text-muted px-6 py-8">Loading detail..</div>
     :collection.err ?
      <ErrorMsg msg={collection.err}/>
    : !collection.cData?
     <div className="bg-base text-muted px-6 py-8">collection detail not found</div>
    :
    <div className={collection.itemLoad ? "opacity-40" : "opacity-100"}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-1 rounded-md text-muted
         hover:text-main-white hover:bg-hover transition-colors hover:cursor-pointer">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-lg text-main-white">{collection.cData?.name}</h1>
          <p className="text-sm text-muted mt-0.5">{collection.assets?.length} asset{collection.assets.length=== 1? "": "s"}</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${collection.cData?.isShared
              ? "bg-info/15 text-info border border-info/30"
              : "bg-secondary-400/30 text-muted border border-secondary-300/20"}`}>
          {collection.cData?.isShared?"Shared" : "Personal"}
        </span>
      </div>

      {collection.assets.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-12 text-center">
        <p className="text-muted text-sm">No assets in collection yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collection.assets?.map((asset) => (
            <div key={asset.id} className="rounded-md border border-border bg-card p-4">
              <button className="block w-full text-left mb-3">
                <div className="w-full h-32 rounded-md bg-secondary-700/50 overflow-hidden flex items-center justify-center mb-2">
                  {asset.thumbnailUrl ? (
                    <img src={asset.thumbnailUrl} alt={asset.fileName} className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  )}
                </div>
                <div className="flex justify-between items-center gap-3 mt-5 flex-wrap">
                  <div>
                    <p className="text-sm text-gray truncate">{asset.fileName}</p>
                    <p className="text-xs text-muted">{(Number(asset.size) / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-center hover:cursor-pointer" title="View"
                    onClick={()=>onOpenAsset(asset.id)}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>

                    </button>
                    <button className="flex-center  text-error hover:text-error-light hover:bg-error/10 rounded-md p-1 transition-colors cursor-pointer" 
                    title="Remove"
                    onClick={()=>onDelAsset(asset.id)}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>

                    </button>
                  </div>
                </div>
                
              </button>

              <div className="flex gap-2">
                <button className="flex-1 text-xs py-1.5 rounded-md bg-secondary-700
                 hover:bg-secondary-600/50 text-gray transition-colors"
                 onClick={()=>handleModal('move', asset.id)}>
                  Move</button>
                <button className="flex-1 text-xs py-1.5 rounded-md bg-secondary-700
                 hover:bg-secondary-600/50 text-gray transition-colors"
                onClick={()=>handleModal('copy', asset.id)}>
                  Copy</button>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    }
    {
      modal.state && (
        <DialogModal isOpen={modal.state ? true : false}
        onClose={()=>setModal((prev)=>({...prev, isSubmit: false, state:null}))}
        title={`${modal.state.type.charAt(0).toUpperCase() + modal.state.type.slice(1)} to Collection`}
        onSubmit={()=>onAssetAction()}
        children={
          !destCols.length?(
              <p className="text-muted text-sm py-4 text-center">
                No other collections avail</p>
            ):(
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {destCols.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-secondary-700/40 hover:bg-secondary-600/40 text-sm text-gray transition-colors cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="targetCollection"
                      value={c.id}
                      checked={modal.state?.cId=== c.id}
                      onChange={() => setModal((prev)=>({...prev, state:{...prev.state!, cId:c.id}}))}
                      className="w-4 h-4 accent-primary-500 cursor-pointer"
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            )}
        isAction
        submitBtn={modal.state.type.toUpperCase()}
        />
      )
    }
    </div>
  );
}

export default CollectionDetail;