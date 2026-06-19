import React, { ReactNode, useEffect } from 'react';

interface PopupProps {
  isOpen:boolean; onClose:() => void;
  title:string; onSubmit?:()=>void;
  disabledBtn?:boolean;
  children:ReactNode;
  isAction:boolean;
  actions?: ReactNode;
  cancelBtn?:string; submitBtn?:string;
}

const DialogModal = ({isOpen,onClose,title,children,actions,isAction,
    onSubmit,disabledBtn, cancelBtn="Cancel", submitBtn="Submit"}:PopupProps) => {

  useEffect(() => {//scroll hide
    document.body.style.overflow = isOpen ? 'hidden' :'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-surface border border-border rounded-md w-full max-w-md p-5">
        <div className="flex items-center justify-between border-gray-200 pb-4">
           <h2 className="text-sm font-medium text-main-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white focus:outline-none hover:cursor-pointer"
          >
            <span className="sr-only">Close</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          {children}
        </div>
        {isAction && (
        actions ? actions :
          <div className="mt-2 flex justify-between gap-3 pt-4">
             <button onClick={()=>onClose()}
            className="px-4 py-2 rounded-md text-sm text-muted
            hover:text-main-white transition-colors hover:cursor-pointer">
                {cancelBtn}</button>
              <button onClick={onSubmit} disabled={disabledBtn}
                className="px-3 py-1.5 rounded-md bg-primary-700 hover:bg-primary-600 
                text-xs text-main-white disabled:opacity-50 transition-colors hover:cursor-pointer"
              >{submitBtn}</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DialogModal;