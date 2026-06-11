import { useEffect, useRef } from "react";

export const useAbortController = () => {
  const abortRef = useRef(new AbortController());
  useEffect(() => {
    return () => abortRef.current.abort();
  }, []);

  return abortRef.current.signal;
};