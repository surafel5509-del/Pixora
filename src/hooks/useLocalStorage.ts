import { useCallback, useEffect, useState } from "react";
import { readJson, writeJson } from "@/lib/storage";

/**
 * State persisted to localStorage. Falls back to in-memory state when storage
 * is unavailable, so the UI keeps working in private browsing modes.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => readJson<T>(key, initialValue));

  useEffect(() => {
    writeJson(key, value);
  }, [key, value]);

  const reset = useCallback(() => setValue(initialValue), [initialValue]);

  return [value, setValue, reset] as const;
}
