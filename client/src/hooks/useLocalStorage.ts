import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export default function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T),
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState(() => {
    const storageValue = localStorage.getItem(key);
    if (storageValue && storageValue.length) {
      return JSON.parse(storageValue);
    }
    if (initialValue instanceof Function) return initialValue();
    return initialValue;
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [value, key]);
  return [value, setValue];
}
