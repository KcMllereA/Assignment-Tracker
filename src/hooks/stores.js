import { useSyncExternalStore } from "react";

function createStore(initialValue) {
    let state = initialValue;
    const listeners = new Set();

    function getSnapshot() {
        return state;
    }

    function subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    }

    function setState(nextState) {
        const resolvedState = typeof nextState === "function" ? nextState(state) : nextState;

        if (Object.is(state, resolvedState)) return;

        state = resolvedState;
        listeners.forEach((listener) => listener());
    }

    return function useStore() {
        const value = useSyncExternalStore(subscribe, getSnapshot);
        return [value, setState];
    };
}

export const useAssignmentDetails = createStore(null);