
import { useState, useEffect, useRef, Dispatch, SetStateAction } from 'react'

// Custom hook to store state in local cache
type SetValue<T> = Dispatch<SetStateAction<T>>;

export function useLocalStorageState<T>(
    key: string,
    initialValue: T
): [T, SetValue<T>] {

    // Get initial value from local storage or use the provided initial value
    const storedValue = typeof window !== 'undefined' ? localStorage.getItem(key) : null
    const initial = storedValue ? JSON.parse(storedValue) : initialValue

    // Set up state to manage the value
    const [value, setValue] = useState<T>(initial);

    // Update local storage when the state changes
    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
}

// Custom hook to skip first render
export const useDidMountEffect = (func: () => void, deps: any[]): void => {
    const didMount = useRef(false);

    useEffect(() => {
        if (didMount.current) {
            func()
        } else {
            didMount.current = true
        }
    }, deps)
}

