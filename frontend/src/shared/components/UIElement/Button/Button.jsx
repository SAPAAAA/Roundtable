import React, {useEffect, useRef} from 'react';
import './Button.css';

/**
 * @param {object} props
 * @param {string} [props.id]
 * @param {string} [props.href]
 * @param {('icon'|'text')} [props.contentType]
 * @param {(event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void} [props.onClick]
 * @param {object} [props.outline]
 * @param {object} [props.background]
 * @param {string|number} [props.padding]
 * @param {string} [props.mainClass]
 * @param {string} [props.addClass]
 * @param {string} [props.tooltipPlacement]
 * @param {string} [props.tooltipTitle]
 * @param {string} [props.dataBsToggle]
 * @param {string} [props.dataBsTarget]
 * @param {string} [props.dataBsTrigger]
 * @param {string} [props.dataBsDismiss]
 * @param {string} [props.ariaLabel]
 * @param {boolean} [props.disabled]
 * @param {React.ReactNode} props.children
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
                    <a href={href} className="text-decoration-none text-white">
                        {children}
                    </a>
                </button>
            );
        } else {
            return (
                <a {...commonProps} href={href}>
                    {children}
                </a>
            );
        }
    } else {
        return <button {...commonProps}>{children}</button>;
    }
}
