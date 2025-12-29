import { useState, useCallback, useRef } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // initialValueをrefで保持して参照の安定性を確保
  const initialValueRef = useRef(initialValue);

  // 初期値を取得（lazy initialization）
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValueRef.current;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValueRef.current;
    }
  });

  // 値を設定
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prevValue) => {
        try {
          const valueToStore = value instanceof Function ? value(prevValue) : value;
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          return valueToStore;
        } catch (error) {
          console.warn(`Error setting localStorage key "${key}":`, error);
          return prevValue;
        }
      });
    },
    [key]
  );

  return [storedValue, setValue];
}
