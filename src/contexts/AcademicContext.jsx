import { createContext, useContext, useSyncExternalStore } from "react";
import { DEFAULT_SELECTOR } from "../hooks/stores";

export const AcademicDataContext = createContext();
export const AcademicActionsContext = createContext();

export function useAcademicStore(selector = DEFAULT_SELECTOR) {
    const store = useContext(AcademicDataContext);
    if (!store) throw new Error("Can only use useAcademicStore inside an AcademicProvider.");
    
    return useSyncExternalStore(store.subscribe, () => selector(store.getSnapshot()));
}

export function useAcademicActions() {
    const value = useContext(AcademicActionsContext);
    if (!value) throw new Error("Can only use useAcademicActions inside an AcademicProvider.");
    return value;
}
