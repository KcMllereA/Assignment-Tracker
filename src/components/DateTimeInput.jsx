import { useId, useRef, useState } from "react";
import styles from "./DateTimeInput.module.css";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DATE_TIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

function parseDateTime(value) {
    const match = DATE_TIME_PATTERN.exec(value ?? "");
    if (!match) return null;

    const [, year, month, day, hour, minute] = match;
    const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
    if (
        date.getFullYear() !== Number(year) ||
        date.getMonth() !== Number(month) - 1 ||
        date.getDate() !== Number(day) ||
        date.getHours() !== Number(hour) ||
        date.getMinutes() !== Number(minute)
    ) {
        return null;
    }
    return date;
}

function formatDateTime(date) {
    if (!date) return "";

    const hour = date.getHours() % 12 || 12;
    const minute = String(date.getMinutes()).padStart(2, "0");
    const meridiem = date.getHours() < 12 ? "AM" : "PM";
    return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}/${date.getFullYear()} ${String(hour).padStart(2, "0")}:${minute} ${meridiem}`;
}

function toDateTimeValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function DateTimeInput({
    value = "",
    onChange,
    id,
    label = "Date and time",
    className,
    required = false,
    disabled = false
}) {
    const inputId = useId();
    const pickerId = useId();
    const anchorName = `--${pickerId.replaceAll(":", "")}`;
    const pickerRef = useRef(null);
    const selectedDate = parseDateTime(value);
    const [previewState, setPreviewState] = useState(() => ({
        value,
        text: formatDateTime(selectedDate)
    }));
    const [monthState, setMonthState] = useState(() => {
        const initial = selectedDate ?? new Date();
        return {
            value,
            month: new Date(initial.getFullYear(), initial.getMonth(), 1)
        };
    });
    const preview = previewState.value === value ? previewState.text : formatDateTime(selectedDate);
    const monthBase = selectedDate ?? new Date();
    const visibleMonth =
        monthState.value === value
            ? monthState.month
            : new Date(monthBase.getFullYear(), monthBase.getMonth(), 1);

    const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
    const firstWeekday = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1).getDay();
    const monthLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(visibleMonth);
    const days = Array.from({ length: firstWeekday + daysInMonth }, (_, index) => index - firstWeekday + 1);
    const hour24 = selectedDate?.getHours() ?? 0;
    const hour12 = hour24 % 12 || 12;
    const minute = selectedDate?.getMinutes() ?? 0;
    const meridiem = hour24 < 12 ? "AM" : "PM";
    const rootClassName = [styles.dateTimeInput, className].filter(Boolean).join(" ");

    function changeTime(hour, minuteValue, meridiemValue) {
        if (!selectedDate) return;
        const hourValue = (hour % 12) + (meridiemValue === "PM" ? 12 : 0);
        const updated = new Date(selectedDate);
        updated.setHours(hourValue, minuteValue, 0, 0);
        onChange?.(toDateTimeValue(updated));
    }

    function selectDay(day) {
        const base = selectedDate ?? new Date();
        const updated = new Date(
            visibleMonth.getFullYear(),
            visibleMonth.getMonth(),
            day,
            base.getHours(),
            base.getMinutes()
        );
        setPreviewState({ value: toDateTimeValue(updated), text: formatDateTime(updated) });
        onChange?.(toDateTimeValue(updated));
    }

    function navigateMonth(offset) {
        setMonthState({
            value,
            month: new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1)
        });
    }

    function openPicker() {
        const picker = pickerRef.current;
        if (!disabled && picker && !picker.matches(":popover-open")) {
            picker.showPopover();
        }
    }

    return (
        <div id={id} className={rootClassName}>
            <label className={styles.label} htmlFor={inputId}>
                {label}
            </label>
            <input
                id={inputId}
                className={styles.preview}
                type="text"
                value={preview}
                placeholder="MM/DD/YYYY HH:MM AM/PM"
                aria-label={label}
                aria-controls={pickerId}
                required={required}
                disabled={disabled}
                style={{ anchorName }}
                readOnly
                onClick={openPicker}
                onFocus={openPicker}
                popoverTarget={pickerId}
            />
            <div
                id={pickerId}
                ref={pickerRef}
                popover="auto"
                className={styles.panel}
                style={{ positionAnchor: anchorName }}>
                    <div className={styles.monthHeader}>
                        <button
                            type="button"
                            aria-label="Previous month"
                            disabled={disabled}
                            onClick={() => navigateMonth(-1)}>
                            Previous
                        </button>
                        <strong aria-live="polite">{monthLabel}</strong>
                        <button
                            type="button"
                            aria-label="Next month"
                            disabled={disabled}
                            onClick={() => navigateMonth(1)}>
                            Next
                        </button>
                    </div>
                    <div className={styles.calendar}>
                        {WEEKDAYS.map((weekday) => (
                            <span key={weekday} className={styles.weekday}>
                                {weekday}
                            </span>
                        ))}
                        {days.map((day, index) => (
                            <span key={index} className={styles.dayCell}>
                                {day > 0 && (
                                    <button
                                        type="button"
                                        className={selectedDate?.getFullYear() === visibleMonth.getFullYear() && selectedDate?.getMonth() === visibleMonth.getMonth() && selectedDate?.getDate() === day ? styles.selectedDay : undefined}
                                        aria-label={new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day))}
                                        aria-pressed={selectedDate?.getFullYear() === visibleMonth.getFullYear() && selectedDate?.getMonth() === visibleMonth.getMonth() && selectedDate?.getDate() === day}
                                        disabled={disabled}
                                        onClick={() => selectDay(day)}>
                                        {day}
                                    </button>
                                )}
                            </span>
                        ))}
                    </div>
                    <fieldset className={styles.timePicker} disabled={disabled || !selectedDate}>
                        <legend>Time</legend>
                        <label htmlFor={`${inputId}-hour`}>Hour</label>
                        <input
                            id={`${inputId}-hour`}
                            type="number"
                            min="1"
                            max="12"
                            value={hour12}
                            onChange={(event) => {
                                const nextHour = Number(event.target.value);
                                if (nextHour >= 1 && nextHour <= 12) changeTime(nextHour, minute, meridiem);
                            }}
                        />
                        <span aria-hidden="true">:</span>
                        <label htmlFor={`${inputId}-minute`}>Minute</label>
                        <input
                            id={`${inputId}-minute`}
                            type="number"
                            min="0"
                            max="59"
                            value={String(minute).padStart(2, "0")}
                            onChange={(event) => {
                                const nextMinute = Number(event.target.value);
                                if (nextMinute >= 0 && nextMinute <= 59) changeTime(hour12, nextMinute, meridiem);
                            }}
                        />
                        <button
                            type="button"
                            aria-label={`Switch to ${meridiem === "AM" ? "PM" : "AM"}`}
                            aria-pressed={meridiem === "PM"}
                            onClick={() => changeTime(hour12, minute, meridiem === "AM" ? "PM" : "AM")}>
                            {meridiem}
                        </button>
                    </fieldset>
            </div>
        </div>
    );
}
