import { createContext, useContext } from "react";

const SettingsContext = createContext();

export function useSettings() {
    return useContext(SettingsContext);
}

export function SettingsProvider({ children }) {
    return <SettingsContext value={{}}>{children}</SettingsContext>;
}
