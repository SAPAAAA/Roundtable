import React from 'react';
import './Input.css';

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
            <span className="input-group-text">{addon || '@'}</span>
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
            <div className='invalid-feedback'>
                {feedback}
            </div>
        </div>
    );
}
