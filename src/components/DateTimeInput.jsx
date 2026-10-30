import { memo, useCallback, useId, useMemo, useRef, useState } from "react";
import { WEEKDAYS, parseDateTime, formatDateTime, toDateTimeValue } from "../util/time";

import styles from "./DateTimeInput.module.css";
import InputLabel from "./InputLabel";

const MONTH_FORMATTER = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });
const DAY_FORMATTER = new Intl.DateTimeFormat("en-US", { dateStyle: "full" });
const WEEKDAY_LABELS = WEEKDAYS.map((weekday) => (
    <span key={weekday} className={styles.weekday}>
        {weekday}
    </span>
));

export default memo(function DateTimeInput({ value = "", onChange, id, label = "Date and time", className, required = false, disabled = false }) {
    const inputId = useId();
    const pickerId = useId();
    const anchorName = `--${pickerId.replaceAll(":", "")}`;
    const pickerRef = useRef(null);
    const selectedDate = useMemo(() => parseDateTime(value), [value]);
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
    const preview = useMemo(() => (previewState.value === value ? previewState.text : formatDateTime(selectedDate)), [previewState, selectedDate, value]);
    const visibleMonth = useMemo(() => {
        const monthBase = selectedDate ?? new Date();
        return monthState.value === value ? monthState.month : new Date(monthBase.getFullYear(), monthBase.getMonth(), 1);
    }, [selectedDate, monthState.month, monthState.value, value]);

    const { monthLabel, days } = useMemo(() => {
        const year = visibleMonth.getFullYear();
        const month = visibleMonth.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstWeekday = new Date(year, month, 1).getDay();
        const selectedYear = selectedDate?.getFullYear();
        const selectedMonth = selectedDate?.getMonth();
        const selectedDay = selectedDate?.getDate();
        const calendarDays = Array.from({ length: firstWeekday + daysInMonth }, (_, index) => {
            const day = index - firstWeekday + 1;
            if (day <= 0) return { key: index, day };

            return {
                key: index,
                day,
                dateLabel: DAY_FORMATTER.format(new Date(year, month, day)),
                isSelected: selectedYear === year && selectedMonth === month && selectedDay === day
            };
        });

        return {
            monthLabel: MONTH_FORMATTER.format(visibleMonth),
            days: calendarDays
        };
    }, [selectedDate, visibleMonth]);
    const hour24 = selectedDate?.getHours() ?? 0;
    const hour12 = hour24 % 12 || 12;
    const minute = selectedDate?.getMinutes() ?? 0;
    const meridiem = hour24 < 12 ? "AM" : "PM";
    const minuteValue = String(minute).padStart(2, "0");
    const nextMeridiem = meridiem === "AM" ? "PM" : "AM";
    const timePickerDisabled = disabled || !selectedDate;
    const rootClassName = useMemo(() => [styles.dateTimeInput, className].filter(Boolean).join(" "), [className]);
    const inputStyle = useMemo(() => ({ anchorName }), [anchorName]);
    const panelStyle = useMemo(() => ({ positionAnchor: anchorName }), [anchorName]);

    const handleDayClick = useCallback(
        (event) => {
            const day = Number(event.currentTarget.dataset.day);
            const year = visibleMonth.getFullYear();
            const month = visibleMonth.getMonth();
            if (selectedDate?.getFullYear() === year && selectedDate.getMonth() === month && selectedDate.getDate() === day) return;

            const base = selectedDate ?? new Date();
            const updated = new Date(year, month, day, base.getHours(), base.getMinutes());
            const updatedValue = toDateTimeValue(updated);
            setPreviewState({ value: updatedValue, text: formatDateTime(updated) });
            onChange?.(updatedValue);
        },
        [onChange, selectedDate, visibleMonth]
    );

    const handleMonthNavigation = useCallback(
        (event) => {
            const offset = Number(event.currentTarget.dataset.monthOffset);
            setMonthState({
                value,
                month: new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1)
            });
        },
        [value, visibleMonth]
    );

    const handleTimeChange = useCallback(
        (event) => {
            if (!selectedDate) return;

            let nextHour = hour12;
            let nextMinute = minute;
            let nextMeridiemValue = meridiem;
            const { part, value: inputValue } = event.currentTarget.dataset;
            if (part === "hour") {
                nextHour = Number(event.currentTarget.value);
                if (nextHour < 1 || nextHour > 12) return;
            } else if (part === "minute") {
                nextMinute = Number(event.currentTarget.value);
                if (nextMinute < 0 || nextMinute > 59) return;
            } else {
                nextMeridiemValue = inputValue;
            }

            const updated = new Date(selectedDate);
            updated.setHours((nextHour % 12) + (nextMeridiemValue === "PM" ? 12 : 0), nextMinute, 0, 0);
            onChange?.(toDateTimeValue(updated));
        },
        [hour12, meridiem, minute, onChange, selectedDate]
    );

    const openPicker = useCallback(() => {
        const picker = pickerRef.current;
        if (!disabled && picker && !picker.matches(":popover-open")) {
            picker.showPopover();
        }
    }, [disabled]);

    return (
        <div id={id} className={rootClassName}>
            <InputLabel className={styles.label} htmlFor={inputId} required={required} label={label} />
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
                style={inputStyle}
                readOnly
                onClick={openPicker}
                onFocus={openPicker}
                popoverTarget={pickerId}
            />
            <div id={pickerId} ref={pickerRef} popover="auto" className={styles.panel} style={panelStyle}>
                <div className={styles.monthHeader}>
                    <button type="button" aria-label="Previous month" data-month-offset="-1" disabled={disabled} onClick={handleMonthNavigation}>
                        Previous
                    </button>
                    <strong aria-live="polite">{monthLabel}</strong>
                    <button type="button" aria-label="Next month" data-month-offset="1" disabled={disabled} onClick={handleMonthNavigation}>
                        Next
                    </button>
                </div>
                <div className={styles.calendar}>
                    {WEEKDAY_LABELS}
                    {days.map(({ key, day, dateLabel, isSelected }) => (
                        <span key={key} className={styles.dayCell}>
                            {day > 0 && (
                                <button type="button" className={isSelected ? styles.selectedDay : undefined} aria-label={dateLabel} aria-pressed={isSelected} data-day={day} disabled={disabled} onClick={handleDayClick}>
                                    {day}
                                </button>
                            )}
                        </span>
                    ))}
                </div>
                <fieldset className={styles.timePicker} disabled={timePickerDisabled}>
                    <legend>Time</legend>
                    <label htmlFor={`${inputId}-hour`}>Hour</label>
                    <input id={`${inputId}-hour`} type="number" min="1" max="12" value={hour12} data-part="hour" onChange={handleTimeChange} disabled={timePickerDisabled} />
                    <span aria-hidden="true">:</span>
                    <label htmlFor={`${inputId}-minute`}>Minute</label>
                    <input id={`${inputId}-minute`} type="number" min="0" max="59" value={minuteValue} data-part="minute" onChange={handleTimeChange} disabled={timePickerDisabled} />
                    <button type="button" aria-label={`Switch to ${nextMeridiem}`} aria-pressed={meridiem === "PM"} data-part="meridiem" data-value={nextMeridiem} onClick={handleTimeChange} disabled={timePickerDisabled}>
                        {meridiem}
                    </button>
                </fieldset>
            </div>
        </div>
    );
});
