import { useCallback, useEffect, useMemo, useReducer } from "react";
import academicReducer, { ACTIONS } from "./academicReducer";
import debugging from "../util/debug";
import useNow from "../hooks/useNow";
import { AcademicContext } from "./AcademicContext";

export function AcademicProvider({ children }) {
    const [academicData, dispatch] = useReducer(academicReducer, null);
    useEffect(() => {
        dispatch({ type: ACTIONS.LOAD_DATA });
        return () => {
            dispatch({ type: ACTIONS.SAVE_DATA });
        };
    }, []);

    useEffect(() => {
        if (academicData) debugging.log(academicData);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [academicData == null]);

    const addClass = useCallback((data) => {
        dispatch({ type: ACTIONS.ADD_CLASS, payload: data });
    }, []);
    const addAssignment = useCallback((data) => {
        dispatch({ type: ACTIONS.ADD_ASSIGNMENT, payload: data });
    }, []);
    const updateAssignment = useCallback((uuid, changes) => {
        dispatch({ type: ACTIONS.UPDATE_ASSIGNMENT, payload: { uuid, changes } });
    }, []);
    const deleteAssignment = useCallback((uuid) => {
        dispatch({ type: ACTIONS.DELETE_ASSIGNMENT, payload: uuid });
    }, []);
    const toggleOpenSection = useCallback((section, state) => {
        dispatch({ type: ACTIONS.TOGGLE_SECTION, payload: { section, state } });
    }, []);

    const now = useNow();
    useEffect(() => {
        if (academicData != null) dispatch({ type: ACTIONS.REFRESH_ASSIGNMENT_SECTIONS, payload: now });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [academicData != null, now]);

    const value = useMemo(
        () => ({
            academicData,
            groupedAssignments: academicData?.groupedAssignments ?? {},
            actions: {
                addClass,
                addAssignment,
                updateAssignment,
                deleteAssignment,
                toggleOpenSection
            }
        }),
        [academicData, addClass, addAssignment, updateAssignment, deleteAssignment, toggleOpenSection]
    );

    return <AcademicContext value={value}>{academicData == null ? "loading" : children}</AcademicContext>;
}
