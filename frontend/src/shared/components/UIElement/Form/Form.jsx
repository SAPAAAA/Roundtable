import React from 'react';
// Import both Form and useFetcher from react-router-dom
import {Form as RouterForm, useFetcher} from 'react-router';

/**
 * Internal component using RouterForm for navigation.
 * (No changes needed here)
 */
function FormWithNavigation(props) {
    const {
        id, mainClass, addClass, style, children, onSubmit, onAbort, onReset, onChange,
        onFocus, onBlur, onInvalid, onInput, method, action, encType, navigate,
        reloadDocument, replace, state, preventScrollReset,
    } = props;
    const combinedClassName = `${mainClass || ''} ${addClass || ''}`.trim();
    return (
        <RouterForm
            id={id}
            className={combinedClassName || undefined}
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

/**
 * Internal component using useFetcher().Form or a passed fetcher instance.
 */
function FormWithoutNavigation(props) {
    const {
        id, mainClass, addClass, style, children, onSubmit, onAbort, onReset, onChange,
        onFocus, onBlur, onInvalid, onInput, method, action, encType,
        fetcher: passedFetcher,
    } = props;

    const internalFetcher = useFetcher();
    const fetcher = passedFetcher || internalFetcher;
    const combinedClassName = `${addClass || ''} ${mainClass || ''}`.trim();

    // Default onSubmit handler for file uploads
    const handleSubmit = (event) => {
        if (onSubmit) {
            onSubmit(event);
        } else {
            event.preventDefault();
            const formData = new FormData(event.target);
            console.log('Submitting FormData via fetcher:', formData);
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }
            fetcher.submit(formData, {
                method: method || 'post',
                encType: encType || 'multipart/form-data',
                action: action,
            });
        }
    };

    return (
        <fetcher.Form
            id={id}
            className={combinedClassName || undefined}
            style={style}
            method={method}
            action={action}
            encType={encType}
            onSubmit={handleSubmit}
            onAbort={onAbort}
            onReset={onReset}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            onInvalid={onInvalid}
            onInput={onInput}
        >
            {children}
        </fetcher.Form>
    );
}

/**
 * A flexible, styled wrapper around react-router-dom's <Form> or <fetcher.Form>.
 *
 * Uses <fetcher.Form> (no navigation) if `preventNavigation` prop is true.
 * Otherwise, uses the standard <Form> (causes navigation).
 * If `preventNavigation` is true, it's recommended to pass a `fetcher` instance
 * created via `useFetcher()` in the parent component for better state management.
 *
 * @component
 *
 * @param {object} props - Component props.
 * @param {boolean} [props.preventNavigation=false] - If true, uses fetcher logic.
 * @param {object} [props.fetcher] - An optional fetcher instance created by `useFetcher()` in the parent. Used when `preventNavigation` is true.
 * @param {string} [props.id] - Unique ID for the form.
 * @param {string} [props.mainClass] - Main CSS class for the form.
 * @param {string} [props.addClass] - Additional custom CSS classes.
 * @param {React.CSSProperties} [props.style] - Inline styles for the form.
 * @param {(e: React.FormEvent<HTMLFormElement>) => void} [props.onSubmit] - Called when the form is submitted.
 * @param {React.ReactNode} props.children - The form's inner content.
 * @param {'get'|'post'} [props.method] - HTTP method.
 * @param {string} [props.action] - URL to submit to.
 * @param {string} [props.encType] - Encoding type.
 * // ... other standard form event handlers ...
 * // ... React Router Form specific props (passed to RouterForm when navigating) ...
 *
 * @returns {JSX.Element} A styled form element.
 */
export default function Form(props) {
    // Destructure the new fetcher prop along with preventNavigation
    const {preventNavigation, fetcher, ...restProps} = props;

    if (preventNavigation) {
        // Pass the fetcher instance (if provided) to FormWithoutNavigation
        return <FormWithoutNavigation {...restProps} fetcher={fetcher}/>;
    } else {
        // Pass remaining props to FormWithNavigation
        return <FormWithNavigation {...restProps} />;
    }
}
