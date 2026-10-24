import { useId, useRef } from "react";

export function Dropdown({ keys = [], values = [], value, onChange, name, label = "Choose an option", id, className, required = false, disabled = false }) {
    const generatedName = useId();
    // CSS didn't wanna be nice to me so I'll force the width to match labels manually
    let maxLength = 0;
    const options = keys.map((key, index) => {
        const label = values[index] ?? key;
        maxLength = Math.max(maxLength, label.length);
        return {
            key,
            label
        };
    });
    const isSelected = (key) => value !== undefined && String(key) === String(value);

    const detailsRef = useRef(null);

    return (
        <details id={id} className={className} data-dropdown disabled={disabled} ref={detailsRef}>
            <summary
                aria-disabled={disabled || undefined}
                onClick={(event) => {
                    if (disabled) event.preventDefault();
                }}>
                {(options.find(({ key }) => isSelected(key))?.label ?? label).padEnd(maxLength, " ")}
            </summary>
            <fieldset aria-label={`${label} options`} disabled={disabled}>
                {options.map(({ key, label: optionLabel }) => (
                    <label key={key} data-dropdown-option>
                        <input
                            type="radio"
                            name={name ?? generatedName}
                            value={key}
                            checked={value === undefined ? undefined : isSelected(key)}
                            required={required}
                            onChange={(event) => {
                                onChange?.(event);
                                detailsRef.current.open = false;
                            }}
                        />
                        {optionLabel}
                    </label>
                ))}
            </fieldset>
        </details>
    );
}
