import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CollectionAsset, CollectionDetail, ModalMode, OtherCollection } from "../../utils/types";
import { useApiService } from "../../services/useApiService";


const CollectionDetail=() =>{
  const param= useParams();
  console.log("id: ", param.id);
  const [collection, setCollection]= useState<{isLoad:boolean, err: string|null, cData:CollectionDetail|null, assets:CollectionAsset[]}>
  ({isLoad: false, cData:null, assets:[], err:null});
  const [modal, setModal] = useState<{state:ModalMode, isSubmit: boolean}>({state:null, isSubmit:false});
  const [otherCollections, setOtherCollections] = useState<OtherCollection[]>([]);
  const {makeReq} = useApiService();
  const navigate= useNavigate();

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


  const onAction = async (cId: number) => {
    if (!modal) return;
    setModal((prev)=>({...prev, isSubmit: true}))
    setTimeout(()=>{
   setModal((prev)=>({...prev, isSubmit: false}))
    },2000);
  };

  const onBack=()=>{
    navigate('/dashboard/collections');
  }
  const onOpenAsset=(aId:number)=>{
    navigate(`dashboar/assets/${aId}`);
  }

  return (
    <div className="bg-base text-main-white px-6 py-8 max-w-6xl mx-auto">
    {collection.isLoad ?
     <div className="bg-base text-muted px-6 py-8">Loadin detail..</div>
    : !collection.cData?
     <div className="bg-base text-muted px-6 py-8">collection detail not found</div>
    :
    <>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-1 rounded-md text-muted
         hover:text-main-white hover:bg-hover transition-colors hover:cursor-pointer">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-lg text-main-white">{collection.cData?.name}</h1>
          <p className="text-sm text-muted mt-0.5">{collection.assets?.length} asset{collection.assets.length === 1 ? "" : "s"}</p>
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
              <button onClick={()=>onOpenAsset(asset.id)} className="block w-full text-left mb-3">
                <div className="w-full h-32 rounded-md bg-secondary-700/50 overflow-hidden flex items-center justify-center mb-2">
                  {asset.thumbnailUrl ? (
                    <img src={asset.thumbnailUrl} alt={asset.fileName} className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  )}
                </div>
                <p className="text-sm text-gray truncate">{asset.fileName}</p>
                <p className="text-xs text-muted">{(Number(asset.size) / 1024 / 1024).toFixed(2)} MB</p>
              </button>

              <div className="flex gap-2">
                <button className="flex-1 text-xs py-1.5 rounded-md bg-secondary-700/50 hover:bg-secondary-600/50 text-gray transition-colors">
                  Move </button>
                <button className="flex-1 text-xs py-1.5 rounded-md bg-secondary-700/50 hover:bg-secondary-600/50 text-gray transition-colors"
                >Copy</button>
              </div>
            </div>
          ))}
        </div>
      )}
      </>
    }
    </div>
  );
}

export default CollectionDetail;