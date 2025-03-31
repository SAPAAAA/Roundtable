import React from "react";

/**
 * A flexible, styled HTML `<form>` component wrapper.
 *
 * Supports common form event handlers and styling props, allowing you to create consistent forms across your app.
 *
 * @component
 *
 * @param {object} props
 * @param {string} [props.id] - Unique ID for the form.
 * @param {string} [props.mainClass] - Main CSS class for the form.
 * @param {string} [props.addClass] - Additional custom CSS classes.
 * @param {React.CSSProperties} [props.style] - Inline styles for the form.
 * @param {(e: React.FormEvent<HTMLFormElement>) => void} [props.onSubmit] - Called when the form is submitted.
 * @param {(e: React.SyntheticEvent<HTMLFormElement>) => void} [props.onAbort] - Called if the form is aborted.
 * @param {(e: React.FormEvent<HTMLFormElement>) => void} [props.onReset] - Called when the form is reset.
 * @param {(e: React.ChangeEvent<HTMLFormElement>) => void} [props.onChange] - Called on any input change inside the form.
 * @param {(e: React.FocusEvent<HTMLFormElement>) => void} [props.onFocus] - Called when the form receives focus.
 * @param {(e: React.FocusEvent<HTMLFormElement>) => void} [props.onBlur] - Called when the form loses focus.
 * @param {(e: React.InvalidEvent<HTMLFormElement>) => void} [props.onInvalid] - Called when form validation fails.
 * @param {(e: React.FormEvent<HTMLFormElement>) => void} [props.onInput] - Called when input events occur in the form.
 * @param {React.ReactNode} props.children - The form’s inner content (inputs, buttons, etc.).
 *
 * @returns {JSX.Element} A styled HTML `<form>` element with enhanced functionality.
 *
 * @example
 * <Form
 *   id="loginForm"
 *   mainClass="needs-validation"
 *   onSubmit={handleSubmit}
 * >
 *   <Input ... />
 *   <Button type="submit">Login</Button>
 * </Form>
 */
export default function Form(props) {
    return (
        <form
            id={props.id}
            className={`${props.mainClass || ''} ${props.addClass || ''}`.trim()}
            style={props.style}
            onSubmit={props.onSubmit}
            onAbort={props.onAbort}
            onReset={props.onReset}
            onChange={props.onChange}
            onFocus={props.onFocus}
            onBlur={props.onBlur}
            onInvalid={props.onInvalid}
            onInput={props.onInput}
        >
            {props.children}
        </form>
    );
}
