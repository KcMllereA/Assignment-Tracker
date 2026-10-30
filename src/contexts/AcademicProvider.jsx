import { useEffect, useLayoutEffect, useMemo, useReducer, useRef } from "react";
import academicReducer, { ACTIONS } from "./academicReducer";
import { AcademicActionsContext, AcademicDataContext } from "./AcademicContext";

export function AcademicProvider({ children }) {
    const [academicData, dispatch] = useReducer(academicReducer, null);

    useLayoutEffect(() => {
        listenersRef.current.forEach((listener) => listener());
    }, [academicData]);

    useEffect(() => {
        dispatch({ type: ACTIONS.LOAD_DATA });
        return () => {
            dispatch({ type: ACTIONS.SAVE_DATA });
        };
    }, [dispatch]);

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
            toggleOpenSection: (section, state) => dispatch({ type: ACTIONS.TOGGLE_SECTION, payload: { section, state } }),
            refreshSections: (now) => dispatch({ type: ACTIONS.REFRESH_ASSIGNMENT_SECTIONS, payload: now })
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
