import { SettingsContext } from "./SettingsContext";

export function SettingsProvider({ children }) {
    return <SettingsContext value={{}}>{children}</SettingsContext>;
}
