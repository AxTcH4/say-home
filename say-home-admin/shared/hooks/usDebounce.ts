import { useEffect, useState } from "react";

export const useDebounce =  ( value: string , delay: number = 300 )=> {
    const [debounceValue, setDebounceValue] = useState<string | null >(null);
    useEffect (() => {
        //Effect 
        const handler = setTimeout(() => {
            console.log(value);
            setDebounceValue(value);
        }, delay);
        
        //cleanup 
        return () => {
        clearTimeout(handler);         
        }
        //deps 
    }, [value])

    return debounceValue
}