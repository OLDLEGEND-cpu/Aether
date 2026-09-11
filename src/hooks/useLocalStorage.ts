import { useEffect, useState } from "react";

/**
 * Generic hook for state synced to localStorage via a getter/setter pair.
 * Used for simple lists like saved prompt IDs.
 */
export function useLocalStorage<T>(
  getInitial: () => T,
  persist: (value: T) => void
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(getInitial);

  useEffect(() => {
    persist(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return [value, setValue];
}
