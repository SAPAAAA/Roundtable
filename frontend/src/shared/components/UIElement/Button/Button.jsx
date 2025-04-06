import React, {useEffect, useRef} from 'react';
import './Button.css';
import Link from "@shared/components/UIElement/Link/Link";

/**
 * A highly flexible and Bootstrap-compatible button component.
 *
 * Supports:
 * - Dynamic rendering as `<button>` or `<a>` based on `href`
 * - Optional outline/background styles
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
 * @param {string} [props.href] - If set, renders as a link (anchor) instead of a button.
 * @param {'icon'|'text'} [props.contentType] - Controls visual layout styling (e.g. icon buttons).
 * @param {(event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void} [props.onClick] - Click handler.
 * @param {{ color: string, depth?: string }} [props.outline] - Outline styling (e.g. `{ color: 'primary', depth: '2' }`).
 * @param {{ color: string }} [props.background] - Background styling (e.g. `{ color: 'success' }`).
 * @param {string|number} [props.padding] - Bootstrap padding size (e.g. `'3'`, `'p-1'`).
 * @param {string} [props.mainClass] - Main CSS class(es).
 * @param {string} [props.addClass] - Extra CSS class(es).
 * @param {string} [props.tooltipPlacement] - Tooltip placement (e.g., `'top'`, `'bottom'`).
 * @param {string} [props.tooltipTitle] - Tooltip text.
 * @param {string} [props.dataBsToggle] - Bootstrap toggle attribute (e.g., `'tooltip'`, `'modal'`).
 * @param {string} [props.dataBsTarget] - Bootstrap target attribute.
 * @param {string} [props.dataBsTrigger] - Bootstrap trigger attribute.
 * @param {string} [props.dataBsDismiss] - Bootstrap dismiss attribute.
 * @param {string} [props.ariaLabel] - ARIA label for accessibility.
 * @param {boolean} [props.disabled=false] - Whether the button is disabled.
 * @param {'button'|'submit'|'reset'} [props.type='button'] - Button type for forms.
 * @param {React.ReactNode} props.children - The button's content.
 *
 * @returns {JSX.Element} A fully styled, behavior-rich button or anchor element.
 *
 * @example
 * <Button type="submit" background={{ color: 'primary' }}>Submit</Button>
 */
export default function Button(props) {
    const {
        id,
        href,
        contentType,
        onClick,
        outline,
        background,
        padding,
        mainClass,
        addClass,
        tooltipPlacement,
        tooltipTitle,
        dataBsToggle,
        dataBsTarget,
        dataBsTrigger,
        dataBsDismiss,
        ariaLabel,
        disabled = false,
        type = 'button',
        children,
    } = props;

    const buttonRef = useRef(null);
    const tooltipInstance = useRef(null);

    useEffect(() => {
        if (tooltipTitle && window.bootstrap && buttonRef.current) {
            tooltipInstance.current = new window.bootstrap.Tooltip(buttonRef.current);
        }
        return () => {
            tooltipInstance.current?.dispose();
        };
    }, [tooltipTitle]);

    const handleClick = (e) => {
        if (disabled) {
            e.preventDefault();
            return;
        }
        onClick?.(e);
        tooltipInstance.current?.hide();
    };

    const isExternal = href && /^https?:\/\//.test(href);
    const computedRel = isExternal ? 'noopener noreferrer' : undefined;

    const outlineClass = outline
        ? `btn-outline-${outline.color}${outline.depth ? ` btn-outline-depth-${outline.depth}` : ''}`
        : '';
    const backgroundClass = background ? `bg-${background.color}` : '';
    const paddingClass = padding ? `p-${padding}` : 'p-2';

    const commonProps = {
        id: id,
        ref: buttonRef,
        className: `${mainClass || ''} btn btn-hover ${contentType === 'icon' ? 'btn-icon' : ''} ${outlineClass} ${backgroundClass} rounded-pill d-flex justify-content-center align-items-center ${paddingClass} ${addClass || ''} ${disabled ? 'disabled' : ''}`,
        onClick: handleClick,
        'data-bs-toggle': dataBsToggle || undefined,
        'data-bs-placement': dataBsToggle === 'tooltip' ? tooltipPlacement : undefined,
        'data-bs-trigger': dataBsTrigger || undefined,
        'data-bs-target': dataBsTarget || undefined,
        'data-bs-title': tooltipTitle || undefined,
        'data-bs-dismiss': dataBsDismiss || undefined,
        'aria-label': ariaLabel || undefined,
        disabled: disabled ? true : undefined,
        rel: computedRel,
    };

    if (href) {
        if (contentType === 'icon') {
            return (
                <button {...commonProps}>
                    <Link href={href} className="text-decoration-none text-white">
                        {children}
                    </Link>
                </button>
            );
        } else {
            return (
                <Link {...commonProps} href={href}>
                    {children}
                </Link>
            );
        }
    } else {
        return <button {...commonProps} type={type}>{children}</button>;
    }
}
