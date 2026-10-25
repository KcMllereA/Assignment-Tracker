import { useId, useRef } from "react";

export function Dropdown({ keys = [], values = [], value, onChange, name, label, placeholder = "Choose an option", id, className, required = false, disabled = false }) {
    const generatedName = useId();
    const optionsId = useId();
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
    const selectedLabel = options.find(({ key }) => isSelected(key))?.label ?? placeholder;

    return (
        <div>
            {label && <label style={{display:"block"}}>{label}</label>}
            <details id={id} className={className} data-dropdown disabled={disabled} ref={detailsRef}>
                <summary style={{minWidth: maxLength + 3 + "ch"}}
                    aria-label={label ? `${label}: ${selectedLabel}` : selectedLabel}
                    aria-controls={optionsId}
                    aria-disabled={disabled || undefined}
                    onClick={(event) => {
                        if (disabled) event.preventDefault();
                    }}>
                    {selectedLabel}
                </summary>
                <fieldset id={optionsId} aria-label={`${label ?? placeholder} options`} disabled={disabled}>
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
        </div>
    );
}
