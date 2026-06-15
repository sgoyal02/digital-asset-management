
import { useState } from "react";
import { AssetDetailProps, formatDate } from "../../utils/types";
import StatusBadge from "../../components/StatusBadge";

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
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-medium text-primary-300 uppercase tracking-widest mb-4">{title}</h3>
      {children}
    </div>
  );
}


function FilePreview({fileUrl, mimeType, fileName }: { fileUrl: string; mimeType: string; fileName: string }) {
  if (mimeType.startsWith("image/")) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-64 bg-secondary-700/50 rounded-xl overflow-hidden">
        <img src={fileUrl} alt={fileName}
          className="max-w-full max-h-96 object-contain rounded-lg"
        />
      </div>
    );
  }
  if (mimeType.startsWith("video/")) {
    return (
      <div className="w-full rounded-xl overflow-hidden bg-secondary-700/50">
        <video controls className="w-full max-h-80 rounded-xl" src={fileUrl} />
      </div>
    );
  }
  if (mimeType.startsWith("audio/")) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 w-full min-h-48 bg-secondary-700/50 rounded-xl p-6">
        <div className="w-16 h-16 rounded-full bg-primary-600/20 border border-primary-500/30 flex items-center justify-center">
          <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5v10M9 19.5v-3.75m0 3.75a1.803 1.803 0 01-1.803-1.803V15m1.803 4.5l-1.32.377A1.803 1.803 0 016 18.084V15" />
          </svg>
        </div>
        <audio controls className="w-full" src={fileUrl} />
      </div>
    );
  }
  return null;
}

const AssetDetail=({
  asset, currentUser,
  onBack,
}: AssetDetailProps) =>{
  const [reviewNote, setReviewNote] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);

  const isOwnAsset = asset.ownerId === currentUser?.id;
  const canReview =(currentUser?.role === "ADMIN" || currentUser?.role === "MANAGER") &&
            !(currentUser?.role === "MANAGER" && isOwnAsset) && !["APPROVED", "REJECTED", "ARCHIVED"].includes(asset.status);

  const expiryDaysLeft = asset.expiryDate
    ? Math.ceil((new Date(asset.expiryDate).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <div className="min-h-screen bg-base text-main-white">
      <div className="sticky top-0 z-10 bg-header border-b border-border backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg text-muted hover:text-main-white hover:bg-hover transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted mb-0.5 uppercase tracking-wider">Asset detail</p>
            <h1 className="text-base font-medium text-main-white truncate">{asset.fileName}</h1>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium`}>
              <StatusBadge status={asset.status} />
          </span>
          <a
            // href={asset.fileUrl}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-700 hover:bg-primary-600 text-sm text-main-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          <div className="lg:col-span-3 space-y-5">
            <Section title="Preview">
                <FilePreview fileUrl={asset.fileUrl} mimeType={asset.mimeType} fileName={asset.fileName} >
             </Section>

            <Section title="Version history">
              {asset.versions?.length > 0 ? (
                <div className="space-y-2">
                  {[...asset.versions].reverse().map((v: any) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg bg-secondary-700/40 border border-border hover:border-primary-500/30 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-primary-700/30 text-primary-300 border border-primary-500/20">
                          v{v.versionNumber}
                        </span>
                        <span className="text-sm text-muted">{formatDate(v.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted">{(asset.size/1024/1024).toFixed(2)} MB</span>
                        <a
                        //   href={v.fileUrl}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-primary-400
                           hover:text-primary-300"
                          title="Download this version"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-sm text-center py-4">no versions yet.</p>
              )}
            </Section>
          </div>

          <div className="lg:col-span-2 space-y-5">
            <Section title="Owner">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary-700/40 border border-primary-500/25 flex items-center justify-center text-primary-300 font-medium text-sm shrink-0">
                  {asset.owner?.name?.charAt(0)?.toUpperCase()?? "-"}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray">{asset.owner?.name?? "Unknown"}</p>
                  <p className="text-xs text-muted">
                    {asset.owner?.department?.name ?? "No department"}
                  </p>
                </div>
              </div>
              <MetaRow label="Asset ID" value={`#${asset.id}`} />
              <MetaRow label="Uploaded" value={formatDate(asset.createdAt)} />
            </Section>

            <Section title="File details">
              <MetaRow label="File name" value={asset.fileName} />
              <MetaRow label="Type" value={asset.mimeType} />
              <MetaRow label="Size" value={`${(asset.size/1024/1024).toFixed(2)} MB`} />
              <MetaRow label="Versions" value={asset.versions?.length ?? 1} />
              <MetaRow
                label="Expires"
                value={
                  asset.expiryDate ? (
                    <span className={expiryDaysLeft !== null && expiryDaysLeft <= 7 ? "text-error" : ""}>
                      {formatDate(asset.expiryDate)}
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
                  <span className={asset.isArchived ? "text-muted" : "text-success text-xs"}>
                    {asset.isArchived ? "Yes" : "No"}
                  </span>
                }
              />
              <MetaRow
                label="Duplicate"
                value={
                  <span className={asset.isDupe ? "text-warning text-xs" : "text-muted text-xs"}>
                    {asset.isDupe ? "Flagged" : "Clean"}
                  </span>
                }
              />
            </Section>

            {canReview && (
              <div className="rounded-xl border border-primary-500/20 bg-primary-900/20 p-5 space-y-4">
                <h3 className="text-sm font-medium text-primary-300 uppercase tracking-widest">Review</h3>
                <textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Add a review note (optional)…"
                  rows={3}
                  className="w-full bg-secondary-700/50 border border-border focus:border-border-focus focus:ring-1 focus:ring-focus-ring rounded-lg px-3 py-2.5 text-sm text-gray placeholder:text-muted resize-none outline-none transition-colors"
                />
                <div className="flex gap-3">
                  <button
                    disabled={isReviewing}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-success/15 hover:bg-success/25 border border-success/30 text-success text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Approve
                  </button>
                  <button
                    disabled={isReviewing}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-error/15 hover:bg-error/25 border border-error/30 text-error text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reject
                  </button>
                </div>
              </div>
            )}

            {currentUser?.role === "ADMIN" && (
              <Section title="Storage">
                <MetaRow label="Bucket key" value={
                  <span className="font-mono text-xs break-all text-muted">{asset.fileKey}</span>
                } />
              </Section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default AssetDetail;