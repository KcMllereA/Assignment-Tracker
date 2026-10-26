import { createContext, useContext } from "react";

export const AcademicContext = createContext();

export function useAcademic() {
    return useContext(AcademicContext);
}