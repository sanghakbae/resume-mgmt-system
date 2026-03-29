import { Dispatch, SetStateAction, useEffect, useState } from "react";

function readStoredValue<T>(key: string, initialValue: T): T {
  if (typeof window === "undefined") {
    return initialValue;
  }

  try {
    const storedValue = window.localStorage.getItem(key);
    return storedValue ? (JSON.parse(storedValue) as T) : initialValue;
  } catch {
    return initialValue;
  }
}

export function useLocalStorageState<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => readStoredValue(key, initialValue));

  useEffect(() => {
    setValue(readStoredValue(key, initialValue));
  }, [initialValue, key]);

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage write failures and keep the in-memory state.
    }
  }, [key, value]);

  return [value, setValue];
}
