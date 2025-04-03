import React from 'react';
import './Input.css';

/**
 * A reusable floating label input field with optional Bootstrap validation feedback.
 *
 * @component
 *
 * @param {object} props
 * @param {string} props.id - Unique ID for the input and associated label.
 * @param {string} [props.type='text'] - Type of input (e.g., 'text', 'email', 'password').
 * @param {string} [props.placeholder] - Placeholder text (required by Bootstrap's floating label).
 * @param {string|number} [props.value] - Input value.
 * @param {(e: React.ChangeEvent<HTMLInputElement>) => void} [props.onChange] - Input change handler.
 * @param {(e: React.FocusEvent<HTMLInputElement>) => void} [props.onFocus] - Input focus handler.
 * @param {(e: React.FocusEvent<HTMLInputElement>) => void} [props.onBlur] - Input blur handler.
 * @param {(e: React.InvalidEvent<HTMLInputElement>) => void} [props.onInvalid] - Validation fail handler.
 * @param {(e: React.FormEvent<HTMLInputElement>) => void} [props.onInput] - Input handler.
 * @param {React.CSSProperties} [props.style] - Inline styles for the input.
 * @param {React.ReactNode} [props.addon] - Optional addon element (e.g., icon).
 * @param {string} [props.label] - Floating label text for the input.
 * @param {string} [props.mainClass] - Main class applied to the input.
 * @param {string} [props.addClass] - Additional class(es) for the input.
 * @param {boolean} [props.isInvalid=false] - Whether the input is in an invalid state.
 * @param {boolean} [props.isValid=false] - Whether the input is in a valid state.
 * @param {string} [props.feedback=''] - Feedback message for invalid state.
 * @param {boolean} [props.required=false] - Whether the input is required.
 *
 * @returns {JSX.Element} A styled input with validation feedback and Bootstrap floating label.
 *
 * @example
 * <Input
 *   id="username"
 *   label="Username"
 *   placeholder="Username"
 *   value={username}
 *   onChange={(e) => setUsername(e.target.value)}
 *   isInvalid={!isValidUsername}
 *   feedback="Username is required."
 *   addon={<i className="bi bi-person" />}
 * />
 */
export default function Input(props) {
    const {
        id,
        type = 'text',
        placeholder,
        value,
        onChange,
        onFocus,
        onBlur,
        onInvalid,
        onInput,
        style,
        addon,
        label,
        mainClass = '',
        addClass = '',
        isInvalid = false,
        isValid = false,
        feedback = '',
        required = false,
    } = props;

    const validationClass = isInvalid
        ? 'is-invalid'
        : isValid
            ? 'is-valid'
            : '';

    return (
        <div className="input-group has-validation mb-3">
            {addon && <span className="input-group-text">{addon}</span>}
            <div className={`form-floating ${validationClass}`}>
                <input
                    id={id}
                    type={type}
                    className={`form-control ${mainClass} ${addClass} ${validationClass}`}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onInvalid={onInvalid}
                    onInput={onInput}
                    style={style}
                    required={required}
                />
                <label htmlFor={id}>{label}</label>
            </div>
            <div className="invalid-feedback">{feedback}</div>
        </div>
    );
}
