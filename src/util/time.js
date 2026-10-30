const rtf = new Intl.RelativeTimeFormat("en", { numeric: "always" });

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

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DATE_TIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

export function parseDateTime(value) {
    const match = DATE_TIME_PATTERN.exec(value ?? "");
    if (!match) return null;

    const [, year, month, day, hour, minute] = match;
    const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
    if (date.getFullYear() !== Number(year) || date.getMonth() !== Number(month) - 1 || date.getDate() !== Number(day) || date.getHours() !== Number(hour) || date.getMinutes() !== Number(minute)) {
        return null;
    }
    return date;
}

export function formatDateTime(date) {
    if (!date) return "";

    const hour = date.getHours() % 12 || 12;
    const minute = String(date.getMinutes()).padStart(2, "0");
    const meridiem = date.getHours() < 12 ? "AM" : "PM";
    return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}/${date.getFullYear()} ${String(hour).padStart(2, "0")}:${minute} ${meridiem}`;
}

export function toDateTimeValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}
