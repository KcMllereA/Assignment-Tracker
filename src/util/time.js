const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const UNITS = [
    { unit: "year", ms: 1000 * 60 * 60 * 24 * 365 },
    { unit: "month", ms: 1000 * 60 * 60 * 24 * 30 },
    { unit: "week", ms: 1000 * 60 * 60 * 24 * 7 },
    { unit: "day", ms: 1000 * 60 * 60 * 24 },
    { unit: "hour", ms: 1000 * 60 * 60 },
    { unit: "minute", ms: 1000 * 60 },
    { unit: "second", ms: 1000 }
];

export function formatRelativeTime(diffMs) {
    if (Math.abs(diffMs) < 1000) {
        return "now";
    }

    for (const { unit, ms } of UNITS) {
        if (Math.abs(diffMs) >= ms || unit === "second") {
            const count = Math.round(diffMs / ms);
            return rtf.format(count, unit);
        }
    }

    return "now";
}

export function dateToInputString(date) {
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - tzOffset).toISOString();

    return localISOTime.slice(0, 16);
}
