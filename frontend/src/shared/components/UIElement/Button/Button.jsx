import React, {useEffect, useRef} from 'react';
import './Button.css';
// Assuming you have bootstrap imported somewhere globally or use a specific setup
// If not using global bootstrap, you might need to import Tooltip specifically:
// import { Tooltip } from 'bootstrap';

/**
 * A highly flexible and Bootstrap-compatible button component.
 *
 * Supports:
 * - Optional outline/background styles
 * - Optional rounded-pill styling (default) or standard corners
 * - Configurable content alignment (justify-content)
 * - Tooltip integration via Bootstrap
 * - External link handling
 * - Icon or text-based content types
 * - Utility props for accessibility, spacing, and interaction
 * - Button types for form interactions
 *
 * @component
 *
 * @param {object} props
 * @param {string} [props.id] - Unique ID for the element.
 * @param {'icon'|'text'} [props.contentType] - Controls visual layout styling (e.g. icon buttons).
 * @param {(event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void} [props.onClick] - Click handler.
 * @param {{ color: string, depth?: string }} [props.outline] - Outline styling (e.g. `{ color: 'primary', depth: '2' }`).
 * @param {{ color: string }} [props.background] - Background styling (e.g. `{ color: 'success' }`). Implies solid button color (e.g., `btn-success`) if `outline` is not set.
 * @param {string|number} [props.padding] - Bootstrap padding size (e.g. `'3'`, `'p-1'`). Defaults to 'p-2'.
 * @param {string} [props.mainClass] - Main CSS class(es) applied before others.
 * @param {string} [props.addClass] - Extra CSS class(es) appended at the end.
 * @param {boolean} [props.rounded=true] - Whether the button should have fully rounded corners (`rounded-pill`). Set to `false` for standard Bootstrap button corners.
 * @param {'start'|'center'|'end'|'between'|'around'|'evenly'} [props.justifyContent='center'] - Controls horizontal alignment of content within the button using Bootstrap's flexbox `justify-content-*` classes. Common values: 'start', 'center', 'end'.
 * @param {string} [props.tooltipPlacement] - Tooltip placement (e.g., `'top'`, `'bottom'`). Requires `tooltipTitle`.
 * @param {string} [props.tooltipTitle] - Tooltip text. Enables Bootstrap tooltip.
 * @param {string} [props.dataBsToggle] - Bootstrap toggle attribute (e.g., `'tooltip'`, `'modal'`). Automatically set to 'tooltip' if `tooltipTitle` is provided.
 * @param {string} [props.dataBsTarget] - Bootstrap target attribute (e.g., for modals).
 * @param {string} [props.dataBsTrigger] - Bootstrap trigger attribute (e.g., for tooltips/popovers). Defaults to 'hover focus' for tooltips.
 * @param {string} [props.dataBsDismiss] - Bootstrap dismiss attribute (e.g., for modals/alerts).
 * @param {string} [props.ariaLabel] - ARIA label for accessibility, especially important for icon buttons. Defaults to `tooltipTitle` for icon buttons if not provided.
 * @param {boolean} [props.disabled=false] - Whether the button is disabled.
 * @param {'button'|'submit'|'reset'} [props.type='button'] - Button type for forms.
 * @param {React.ReactNode} props.children - The button's content (text, icon, etc.).
 *
 * @returns {JSX.Element} A fully styled, behavior-rich button element.
 *
 * @example
 * // Centered content (default)
 * <Button background={{ color: 'primary' }}>Centered Text</Button>
 *
 * @example
 * // Content aligned to the start (left in LTR)
 * <Button background={{ color: 'secondary' }} justifyContent="start" addClass="w-100">
 * <i className="bi bi-arrow-left me-2"></i> Left Aligned
 * </Button>
 *
 * @example
 * // Icon button with tooltip, standard corners, centered (default)
 * <Button
 * contentType="icon"
 * outline={{ color: 'secondary' }}
 * rounded={false}
 * tooltipTitle="Settings"
 * ariaLabel="Settings"
 * >
 * <i className="bi bi-gear"></i>
 * </Button>
 */
export default function Button(props) {
    const {
        id,
        contentType,
        onClick,
        outline,
        background,
        padding,
        mainClass,
        addClass,
        rounded = true,
        justifyContent = 'center',
        tooltipPlacement = 'top',
        tooltipTitle,
        dataBsToggle,
        dataBsTarget,
        dataBsTrigger,
        dataBsDismiss,
        ariaLabel,
        disabled = false,
        type = 'button',
        children,
        className,
    } = props;

    const buttonRef = useRef(null);
    const tooltipInstance = useRef(null);

    // --- Tooltip Effect ---
    useEffect(() => {
        const BootstrapTooltip = window.bootstrap?.Tooltip;
        if (tooltipTitle && BootstrapTooltip && buttonRef.current) {
            tooltipInstance.current = new BootstrapTooltip(buttonRef.current, {
                title: tooltipTitle,
                placement: tooltipPlacement,
                trigger: dataBsTrigger || 'hover focus',
            });
        }
        return () => {
            tooltipInstance.current?.dispose();
            tooltipInstance.current = null;
        };
    }, [tooltipTitle, tooltipPlacement, dataBsTrigger]);

    // --- Update Tooltip Title Dynamically ---
    useEffect(() => {
        if (tooltipInstance.current) {
            tooltipInstance.current.setContent({'.tooltip-inner': tooltipTitle});
        }
    }, [tooltipTitle]);

    // --- Click Handler ---
    const handleClick = (e) => {
        if (disabled) {
            e.preventDefault();
            return;
        }
        onClick?.(e);
        tooltipInstance.current?.hide();
    };

    /// --- Determine Final Classes ---
    let finalClasses;

    if (className) {
        // If an external className is provided, USE IT EXCLUSIVELY.
        finalClasses = `${className}${disabled ? ' disabled' : ''}`.trim().replace(/\s+/g, ' ');

    } else {
        // --- Otherwise, construct classes internally as before ---
        const internalClasses = ['btn']; // Start with base 'btn'

        // Prepend mainClass if provided
        if (mainClass) internalClasses.unshift(mainClass);

        // Add content type class
        if (contentType === 'icon') internalClasses.push('btn-icon');

        // Add style classes (Outline or Solid Color)
        let styleClass = '';
        if (outline) {
            styleClass = `btn-outline-${outline.color}`;
            if (outline.depth) styleClass += ` btn-outline-depth-${outline.depth}`;
            if (background) styleClass += ` bg-${background.color}`; // Optional background with outline
        } else if (background) {
            styleClass = `btn-${background.color}`; // Standard solid color
        }
        if (styleClass) internalClasses.push(styleClass);

        // Add shape class
        if (rounded) {
            internalClasses.push('rounded-pill');
        }

        // Add layout and utility classes (Flexbox for content alignment)
        internalClasses.push(
            'd-flex',
            `justify-content-${justifyContent}`,
            'align-items-center'
        );

        // Add padding class
        internalClasses.push(padding ? (padding.startsWith('p-') ? padding : `p-${padding}`) : 'p-2');

        // Append addClass if provided
        if (addClass) internalClasses.push(addClass);

        // Add disabled class (important for styling and interaction)
        if (disabled) internalClasses.push('disabled');

        // Join the internally constructed classes
        finalClasses = internalClasses.join(' ').trim().replace(/\s+/g, ' ');
    }

    // --- Props for the element ---
    const commonProps = {
        id: id,
        ref: buttonRef,
        className: finalClasses, // Use the conditionally determined classes
        onClick: handleClick,
        ...(tooltipTitle && {'data-bs-toggle': 'tooltip'}),
        ...(tooltipTitle && {'data-bs-placement': tooltipPlacement}),
        ...(dataBsTarget && {'data-bs-target': dataBsTarget}),
        ...(tooltipTitle && {'data-bs-trigger': dataBsTrigger || 'hover focus'}),
        ...(dataBsDismiss && {'data-bs-dismiss': dataBsDismiss}),
        'aria-label': ariaLabel || (contentType === 'icon' && tooltipTitle ? tooltipTitle : undefined),
        disabled: disabled || undefined,
    };

    // Clean up any props that ended up with undefined values
    Object.keys(commonProps).forEach(key => {
        if (commonProps[key] === undefined) {
            delete commonProps[key];
        }
    });


    return (
        <button {...commonProps} type={type}>
            {children}
        </button>
    );
}