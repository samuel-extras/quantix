// hooks/useBannerState.ts
import { useState, useEffect } from "react";

export function useBannerState(id?: string) {
    const globalKey = id ? `banner-${id}` : undefined;
    const [isOpen, setIsOpen] = useState<boolean>(true);
    console.log({ isOpen, id });

    useEffect(() => {
        if (globalKey) {
            const isClosed = localStorage.getItem(globalKey) === "true";
            setIsOpen(!isClosed);
        }
    }, [globalKey]);

    // Listen for changes in localStorage
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (globalKey && e.key === globalKey) {
                setIsOpen(e.newValue !== "true");
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [globalKey]);

    return { isOpen, height: isOpen ? "2rem" : "0" };
}
