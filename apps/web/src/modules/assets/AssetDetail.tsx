
import { useEffect, useState } from "react";
import { Asset, formatDate } from "../../utils/types";
import StatusBadge from "../../components/StatusBadge";
import { useNavigate, useParams } from "react-router-dom";
import { useApiService } from "../../services/useApiService";
import ErrorMsg from "../../components/ErrorMsg";
import { useAuth } from "../../hooks/useAuth";

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-border last:border-0">
      <span className="text-muted text-sm shrink-0 w-28">{label}</span>
      <span className="text-gray text-sm text-right break-all">{value ?? "—"}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <h3 className="text-sm font-medium text-primary-300 uppercase tracking-widest mb-4">{title}</h3>
      {children}
    </div>
  );
}


function FilePreview({fileUrl, mimeType, fileName }: { fileUrl: string; mimeType: string; fileName: string }) {
  const [imgErr, setImgErr] = useState(false);
  if (mimeType.startsWith("image/")) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-64 bg-secondary-700/50 rounded-md overflow-hidden">
        {imgErr ? (
          <div className="flex flex-col items-center gap-2 text-muted">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-sm">img not load</p>
            <a href={fileUrl} target="_blank" rel="noreferrer" className="text-primary-400 text-xs underline">
              open here
            </a>
          </div>
        ) : (
        <img src={fileUrl} alt={fileName}
          className="max-w-full max-h-96 object-contain rounded-md"
          onError={() => setImgErr(true)}
        />)}
      </div>
    );
  }
  if (mimeType.startsWith("video/")) {
    return (
      <div className="w-full rounded-md overflow-hidden bg-secondary-700/50">
        <video controls className="w-full max-h-80 rounded-md" src={fileUrl} />
      </div>
    );
  }
  if (mimeType.startsWith("audio/")) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 w-full min-h-48 bg-secondary-700/50 rounded-md p-6">
        <div className="w-16 h-16 rounded-full bg-primary-600/20 border border-primary-500/30 flex items-center justify-center">
          <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5v10M9 19.5v-3.75m0 3.75a1.803 1.803 0 01-1.803-1.803V15m1.803 4.5l-1.32.377A1.803 1.803 0 016 18.084V15" />
          </svg>
        </div>
        <audio controls className="w-full" src={fileUrl} />
      </div>
    );
  }
  if (mimeType === "application/pdf") {
  return (
    <div className="w-full h-[300px] rounded-md overflow-hidden border border-border">
      <iframe
        src={fileUrl}
        title={fileName}
        className="w-full h-full"
      />
    </div>
  );
}
  return (
    <div className="flex flex-col items-center justify-center gap-3 w-full min-h-64 bg-secondary-700/50 rounded-xl border border-border">
      <div className="w-16 h-16 rounded-xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-center">
        <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>
      <p className="text-muted text-sm">{mimeType}</p>
      <a
        href={fileUrl}
        download={fileName}
        className="px-4 py-2 rounded-lg bg-primary-700 hover:bg-primary-600 text-main-white text-sm transition-colors"
      >
        Download file
      </a>
    </div>
  );
}

const AssetDetail=() =>{
  const param= useParams();
  const [isReview, setReview] = useState<{process:boolean, err:string|null}>({process: false, err:null});
  const [asset, setAsset] = useState<{data:Asset|null, isLoad:boolean, err:string|null}>({data:null, isLoad: false, err:null});
  const [reqReview, setReqReview] = useState<{process:boolean, err:string|null}>({process: false, err:null});
  const { makeReq } = useApiService();
  const navigate= useNavigate();
  const {user:currentUser}= useAuth();
  
  useEffect(()=>{
    fetchAssetDetail();
  },[]);

  const fetchAssetDetail=async()=>{
     setAsset((prev)=>({...prev, isLoad: true}));
    try{
      const res= await makeReq({
        method:'GET',
        url: `/assets/${param.id}`
      });
      setAsset((prev)=>({...prev, isLoad: false,
         data: res?.data || res
        }));
    } catch (err: unknown) {
      const errMsg= err as {data:{message?:string, statusCode?:number}};
      setAsset((prev)=>({...prev, isLoad: false, err: errMsg.data.message|| 'failed fetch asset detail'}))
    }
  }
  
  const isOwnAsset = asset.data?.ownerId === currentUser?.id;
  const canReview =asset.data && (currentUser?.role !=="USER") && !isOwnAsset &&
                  !["APPROVED", "REJECTED", "ARCHIVED"].includes(asset.data?.status);

  const expiryDaysLeft = asset.data?.expiryDate? 
                  Math.ceil((new Date(asset.data?.expiryDate).getTime() - Date.now()) / 86400000): null;

  const onBack=()=>{
    if(param.collectionId)
    navigate(`/dashboard/collections/${param.collectionId}`);
    else
    navigate('/dashboard/assets');
  }

  const handleReview= async(action:"APPROVED"|"REJECTED") => {
    setReview((prev)=>({...prev, process: true, err:null}))
    try {
      const res = await makeReq({
        method: 'PATCH',
        url: `/assets/${param.id}/review`,
        data: {action},
      });
      // const updated = res?.data || res;
      // setAsset((prev: any) => ({ ...prev, data: updated }));
      onBack(); //main list--? or same ui- vNum check
    } catch (err: unknown) {
      const errMsg= err as {data:{message:string, statusCode?:number}};
      setReview((prev)=>({...prev, err:errMsg.data.message || "review action fail"}))
    } finally {
      setReview((prev)=>({...prev, process: false}))
    }
  };

  const handleDownload = async (fileName:string|undefined, fileUrl:string|undefined) => {
  if(!fileUrl) return;
  const res = await fetch(fileUrl);
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName|| "file";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

  const onReqReview=async()=>{
    setReqReview((prev)=>({...prev, process: true, err:null}))
    try {
      const res = await makeReq({
        method: 'PATCH',
        url: `/assets/${param.id}/request-review`
      });
      const updated = res?.data || res;
      setAsset((prev: any) => ({ ...prev, data: {...prev.data, status:currentUser?.role ==="ADMIN"? "APPROVED": "UNDER_REVIEW"} }));
    } catch (err: any) {
      setReqReview((prev)=>({...prev, err:err.message || "review action fail"}))
    } finally {
      setReqReview((prev)=>({...prev, process: false}))
    }
  }

  return (
    <div className="min-h-screen bg-base text-main-white">
      {asset.isLoad ?
      <div className="text-center py-12 text-gray-400">Loading detail...</div>
      : asset.err ?
        <ErrorMsg msg={asset.err}/>
      : !asset.data ?
        <div className="text-center py-12 text-gray-400">asset detail not found.</div>
      :
      <div>
      <div className="sticky top-0 z-10 bg-header border-border backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-2 py-4 flex flex-wrap items-center gap-4">
          <button
            onClick={onBack}
            className="p-1 rounded-md text-muted hover:text-main-white hover:bg-hover transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <p className="text-xs text-muted mb-0.5 uppercase tracking-wider">Asset detail</p>
            <h1 className="text-base font-medium text-main-white truncate">{asset.data?.fileName}</h1>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium`}>
              <StatusBadge status={asset.data?.status} />
          </span>
          {isOwnAsset && asset.data?.status==="UPLOADED" &&
          <button onClick={()=>onReqReview()}
            disabled={reqReview.process}
            className="flex items-center gap-2 p-2 rounded-md bg-info
            hover:cursor-pointer hover:bg-info text-sm text-main-white transition-colors"
          >Request Review</button>
          }
          <button
            onClick={()=>handleDownload(asset.data?.fileName,asset.data?.fileUrl)}
            className="flex items-center gap-2 p-2 rounded-md bg-primary-700
            hover:cursor-pointer hover:bg-primary-600 text-sm text-main-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
        </div>
      </div>
        
      {!!reqReview.err && (
        <p className="text-error text-xs">{reqReview.err}</p>
      )}

      <div className="max-w-6xl mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          <div className="lg:col-span-3 space-y-5">
            <Section title="Preview">
                <FilePreview fileUrl={asset.data?.fileUrl} mimeType={asset.data?.mimeType} fileName={asset.data?.fileName}/>
             </Section>

            <Section title="Version history">
              {asset.data?.versions?.length > 0 ? (
                <div className="space-y-2">
                  {[...asset.data.versions].reverse().map((v: any) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between gap-4 px-4 py-3 rounded-md bg-secondary-700/40 border border-border hover:border-primary-500/30 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-primary-700/30 text-primary-300 border border-primary-500/20">
                          v{v.versionNumber}
                        </span>
                        <span className="text-sm text-muted">{formatDate(v.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted">{asset.data?.size ? (asset.data?.size/1024/1024).toFixed(2) : 0} MB</span>
                        <button 
                        onClick={() => {
                            const ext = v.fileUrl?.split(".").pop()||"jpg";
                            handleDownload(`v${v.versionNumber}.${ext}`, v.fileUrl);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-primary-400
                           hover:text-primary-300 hover:cursor-pointer"
                          title="download version"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-sm text-center py-4">no versions yet.</p>
              )}
            </Section>
            {canReview && (
              <div className="rounded-md border border-primary-500/20 bg-primary-900/20 p-5 space-y-4">
                <h3 className="text-sm font-medium text-primary-300 uppercase tracking-widest">Review</h3>
                {isReview.err && (
                  <p className="text-error text-xs">{isReview.err}</p>
                )}
                <div className="flex gap-3">
                  <button
                    disabled={isReview.process}
                    onClick={()=>handleReview("APPROVED")}
                    className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-md bg-success/50 hover:bg-success hover:cursor-pointer border border-success/30 text-white text-sm 
                    font-sm disabled:opacity-50"
                  >
                   <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                    Approve
                  </button>
                  <button
                    disabled={isReview.process}
                    onClick={()=>handleReview("REJECTED")}
                    className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-md bg-error/50 hover:bg-error border border-error/30 
                    text-white text-sm font-sm disabled:opacity-50 hover:cursor-pointer"
                  >
                    <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-5">
            <Section title="Owner">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary-700/40 border border-primary-500/25 flex items-center justify-center text-primary-300 font-medium text-sm shrink-0">
                  {asset.data?.owner?.name?.charAt(0)?.toUpperCase()?? "-"}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray">{asset.data?.owner?.name?? "Unknown"}</p>
                  <p className="text-xs text-muted">
                    {asset.data?.owner?.department?.name ?? "No department"}
                  </p>
                </div>
              </div>
              <MetaRow label="Asset ID" value={`#${asset.data?.id}`} />
              <MetaRow label="Uploaded" value={formatDate(asset.data?.createdAt)} />
            </Section>

            <Section title="File details">
              <MetaRow label="File name" value={asset.data?.fileName} />
              <MetaRow label="Type" value={asset.data?.mimeType} />
              <MetaRow label="Size" value={`${(asset.data?.size/1024/1024).toFixed(2)} MB`} />
              <MetaRow label="Versions" value={asset.data?.versions?.length ?? 1} />
              {asset.data?.duration && (
                <MetaRow label="Duration" value={`${Math.round(asset.data?.duration)}s`} />
              )}
              <MetaRow
                label="Expires"
                value={
                  asset.data?.expiryDate ? (
                    <span className={expiryDaysLeft !== null && expiryDaysLeft <= 7 ? "text-error" : ""}>
                      {formatDate(asset.data?.expiryDate)}
                      {expiryDaysLeft !== null && expiryDaysLeft > 0 && (
                        <span className="text-muted ml-1">({expiryDaysLeft}d)</span>
                      )}
                    </span>
                  ) : "no expiry"
                }
              />
               <MetaRow
                label="Archived"
                value={
                  <span className={asset.data?.isArchived ? "text-muted" : "text-success text-sm"}>
                    {asset.data?.isArchived ? "Yes" : "No"}
                  </span>
                }
              />
              <MetaRow
                label="Duplicate"
                value={
                  <span className={asset.data?.isDupe ? "text-warning text-sm" : "text-sm"}>
                    {asset.data?.isDupe ? "Flagged" : "Clean"}
                  </span>
                }
              />
            </Section>

            {currentUser?.role === "ADMIN" && (
              <Section title="Storage">
                <MetaRow label="Bucket key" value={
                  <span className="font-mono text-xs break-all text-muted">{asset.data?.fileKey}</span>
                } />
              </Section>
            )}
          </div>
        </div>
      </div>
      </div>
      }
    </div>
  );
}
export default AssetDetail;