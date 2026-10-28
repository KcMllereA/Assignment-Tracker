import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import academicReducer, { ACTIONS } from "./academicReducer";
import useNow from "../hooks/useNow";
import { AcademicActionsContext, AcademicDataContext } from "./AcademicContext";

export function AcademicProvider({ children }) {
    const [academicData, rawDispatch] = useReducer(academicReducer, null);
    const dispatch = useCallback((action) => {
        rawDispatch(action);

        queueMicrotask(() => {
            listenersRef.current.forEach((listener) => listener());
        });
    }, []);

    useEffect(() => {
        dispatch({ type: ACTIONS.LOAD_DATA });
        return () => {
            dispatch({ type: ACTIONS.SAVE_DATA });
        };
    }, [dispatch]);

    const now = useNow();
    useEffect(() => {
        if (academicData != null) dispatch({ type: ACTIONS.REFRESH_ASSIGNMENT_SECTIONS, payload: now });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [academicData != null, now]);

    const stateRef = useRef(academicData);
    // eslint-disable-next-line react-hooks/refs
    stateRef.current = academicData;
    
    const listenersRef = useRef(new Set());

    const actions = useMemo(() => {
        return {
            addClass: (data) => dispatch({ type: ACTIONS.ADD_CLASS, payload: data }),
            addAssignment: (data) => dispatch({ type: ACTIONS.ADD_ASSIGNMENT, payload: data }),
            updateAssignment: (uuid, changes) => dispatch({ type: ACTIONS.UPDATE_ASSIGNMENT, payload: { uuid, changes } }),
            deleteAssignment: (uuid) => dispatch({ type: ACTIONS.DELETE_ASSIGNMENT, payload: uuid }),
            toggleOpenSection: (section, state) => dispatch({ type: ACTIONS.TOGGLE_SECTION, payload: { section, state } })
        };
    }, [dispatch]);

    const storeValue = useMemo(
        () => ({
            subscribe: (listener) => {
                listenersRef.current.add(listener);
                return () => listenersRef.current.delete(listener);
            },
            getSnapshot: () => stateRef.current
        }),
        []
    );

    return (
        <AcademicDataContext value={storeValue}>
            <AcademicActionsContext value={actions}>{academicData == null ? "Loading..." : children}</AcademicActionsContext>
        </AcademicDataContext>
    );
}