import { useEffect, useState } from "react";

export const useDebounce = (value: string, delay = 300) => {
  const [debounceValue, setDebounceValue] = useState<string | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounceValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debounceValue;
};
