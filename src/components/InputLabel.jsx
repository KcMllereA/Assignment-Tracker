import { memo } from "react";

const PREVENT_DEFAULT = (e) => e.preventDefault();

export default memo(function InputLabel({ label, required, onClick = PREVENT_DEFAULT, ...props }) {
    return (
        <label onClick={onClick} {...props}>
            {label}
            {required && <span style={{ color: "red", fontWeight: "bolder" }}> *</span>}
        </label>
    );
});
