import { useSyncExternalStore } from "react";

const INTERVAL_MS = import.meta.env.DEV ? 1_000 : 60_000;

let now = Date.now();
let timerId = null;
const listeners = new Set();

function tick() {
    now = Date.now();
    listeners.forEach((listener) => listener());
}

function scheduleNextTick() {
    const current = Date.now();
    const delay = INTERVAL_MS - (current % INTERVAL_MS);

    timerId = setTimeout(() => {
        tick();
        timerId = setInterval(tick, INTERVAL_MS);
    }, delay);
}

function clearActiveTimer() {
    if (timerId) {
        clearTimeout(timerId);
        clearInterval(timerId);
        timerId = null;
    }
}

function subscribe(listener) {
    if (listeners.size === 0) {
        now = Date.now();
        scheduleNextTick();
    }

    listeners.add(listener);

    return () => {
        listeners.delete(listener);

        if (listeners.size === 0) {
            clearActiveTimer();
        }
    };
}

function getSnapshot() {
    if (listeners.size === 0) {
        return Date.now();
    }
    return now;
}

export default function useNow() {
    return useSyncExternalStore(subscribe, getSnapshot);
}
