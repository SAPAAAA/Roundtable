import React from "react";
import {Form as RouterForm} from "react-router";

/**
 * A flexible, styled wrapper around the react-router-dom <Form> component.
 *
 * Supports common form event handlers, custom styling props, and React Router's
 * data submission capabilities (method, action, encType, etc.).
 *
 * @component
 *
 * @param {object} props - Component props.
 * @param {string} [props.id] - Unique ID for the form.
 * @param {string} [props.mainClass] - Main CSS class for the form.
 * @param {string} [props.addClass] - Additional custom CSS classes.
 * @param {React.CSSProperties} [props.style] - Inline styles for the form.
 * @param {(e: React.FormEvent<HTMLFormElement>) => void} [props.onSubmit] - Called when the form is submitted. Note: React Router may intercept default submission.
 * @param {(e: React.SyntheticEvent<HTMLFormElement>) => void} [props.onAbort] - Called if the form submission is aborted (less common with client-side routing).
 * @param {(e: React.FormEvent<HTMLFormElement>) => void} [props.onReset] - Called when the form is reset.
 * @param {(e: React.ChangeEvent<HTMLFormElement>) => void} [props.onChange] - Called on any input change inside the form.
 * @param {(e: React.FocusEvent<HTMLFormElement>) => void} [props.onFocus] - Called when the form receives focus.
 * @param {(e: React.FocusEvent<HTMLFormElement>) => void} [props.onBlur] - Called when the form loses focus.
 * @param {(e: React.InvalidEvent<HTMLFormElement>) => void} [props.onInvalid] - Called when form validation fails.
 * @param {(e: React.FormEvent<HTMLFormElement>) => void} [props.onInput] - Called when input events occur in the form.
 * @param {React.ReactNode} props.children - The form’s inner content (inputs, buttons, etc.).
 *
 * // React Router Form specific props
 * @param {'get'|'post'} [props.method] - HTTP method for form submission (default: 'get').
 * @param {string} [props.action] - URL to submit the form to (default: current URL).
 * @param {string} [props.encType] - Encoding type for form submission (default: 'application/x-www-form-urlencoded').
 * @param {string} [props.navigate] - Custom navigation function (if needed).
 * @param {boolean} [props.reloadDocument] - If true, forces a full page reload on submission.
 * @param {boolean} [props.replace] - If true, replaces the current entry in the history stack.
 * @param {any} [props.state] - State to pass to the new location.
 * @param {boolean} [props.preventScrollReset] - If true, prevents scroll reset on navigation.
 *
 * @returns {JSX.Element} A styled react-router-dom `<Form>` element with enhanced functionality.
 *
 * @example
 * // Example using React Router action
 * <Form
 *   id="loginForm"
 *   mainClass="user-form"
 *   addClass="needs-validation"
 *   method="post" // Submits to the route's action function
 *   onSubmit={handleClientSideValidation} // Optional: Client-side checks before RR submission
 * >
 *   <Input name="username" ... />
 *   <Input name="password" type="password" ... />
 *   <Button type="submit">Login</Button>
 * </Form>
 *
 * @example
 * // Example for simple GET search form (client-side navigation)
 * <Form
 *   id="searchForm"
 *   mainClass="search-bar"
 *   method="get"
 *   action="/search" // Navigates to /search?q=... on submit
 * >
 *   <Input name="q" placeholder="Search..." />
 *   <Button type="submit">Search</Button>
 * </Form>
 */
export default function Form(props) {
    const {
        // Destructure your custom props and standard ones you handle specially
        id,
        mainClass,
        addClass,
        style,
        children,
        onSubmit,
        onAbort,
        onReset,
        onChange,
        onFocus,
        onBlur,
        onInvalid,
        onInput,
        // Destructure React Router specific props to pass them explicitly
        method,
        action,
        encType,
        navigate,
        reloadDocument,
        replace,
        state,
        preventScrollReset,
    } = props;

    // Combine custom classes
    const combinedClassName = `${mainClass || ''} ${addClass || ''}`.trim();

    return (
        <RouterForm
            id={id}
            className={combinedClassName}
            style={style}
            method={method}
            action={action}
            encType={encType}
            navigate={navigate}
            reloadDocument={reloadDocument}
            replace={replace}
            state={state}
            preventScrollReset={preventScrollReset}
            onSubmit={onSubmit}
            onAbort={onAbort}
            onReset={onReset}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            onInvalid={onInvalid}
            onInput={onInput}
        >
            {children}
        </RouterForm>
    );
}