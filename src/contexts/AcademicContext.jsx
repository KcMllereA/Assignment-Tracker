import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import academicReducer, { ACTIONS } from "./academicReducer";
import debugging from "../util/debug";
import { groupSections } from "../logic/assignments";

const AcademicContext = createContext();

export function useAcademic() {
    return useContext(AcademicContext);
}

export function AcademicProvider({ children }) {
    const [academicData, dispatch] = useReducer(academicReducer, null);
    useEffect(() => {
        dispatch({ type: ACTIONS.LOAD_DATA });
        return () => {
            dispatch({ type: ACTIONS.SAVE_DATA });
        };
    }, []);

    const addClass = useCallback((data) => {
        dispatch({ type: ACTIONS.ADD_CLASS, payload: data });
    }, []);
    const addAssignment = useCallback((data) => {
        dispatch({ type: ACTIONS.ADD_ASSIGNMENT, payload: data });
    }, []);
    const updateAssignment = useCallback((uuid, changes) => {
        dispatch({ type: ACTIONS.UPDATE_ASSIGNMENT, payload: {uuid, changes} });
    }, []);

    const groupedAssignments = useMemo(() => {
        return academicData == null ? {} : groupSections(academicData.assignments, Date.now());
    }, [academicData?.assignments]);

    debugging.log(academicData);
    return (
        <AcademicContext
            value={{
                academicData,
                groupedAssignments,
                actions: {
                    addClass,
                    addAssignment,
                    updateAssignment
                }
            }}>
            {academicData == null ? "loading" : children}
        </AcademicContext>
    );
}
