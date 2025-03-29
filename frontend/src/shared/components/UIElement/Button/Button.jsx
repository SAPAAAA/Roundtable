import React, {useEffect, useRef} from 'react';
import './Button.css';

export default function Button(props) {

    const {
        id,                // Unique identifier for the button
        href,              // URL to navigate to when the button is clicked
        contentType,       // Type of content inside the button (e.g., 'icon', 'text')
        onClick,           // Click event handler function
        outline,           // Outline style configuration for the button
        background,        // Background style configuration for the button
        padding,           // Padding size for the button
        mainClass,         // Main CSS class for the button
        addClass,          // Additional CSS classes for the button
        tooltipPlacement,  // Tooltip placement position
        tooltipTitle,      // Tooltip text
        dataBsToggle,      // Bootstrap toggle attribute (e.g., 'tooltip', 'modal')
        dataBsTarget,      // Bootstrap target attribute
        dataBsTrigger,     // Bootstrap trigger attribute
        dataBsDismiss,     // Bootstrap dismiss attribute
        ariaLabel,         // ARIA label for accessibility
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
        onClick?.(e);
        tooltipInstance.current?.hide();
    };

    // Build dynamic class names
    const outlineClass = outline
        ? `btn-outline-${outline.color}${outline.depth ? ` btn-outline-depth-${outline.depth}` : ''}`
        : '';

    const backgroundClass = background
        ? `bg-${background.color}`
        : '';

    // Use the passed padding prop or default to "p-2"
    const paddingClass = padding ? padding : "2";

    const commonProps = {
        id: id,
        ref: buttonRef,
        className: `${mainClass || ''} btn btn-hover ${contentType === 'icon' ? 'btn-icon' : ''} ${outlineClass} ${backgroundClass} rounded-pill d-flex justify-content-center align-items-center p-${paddingClass} ${addClass || ''}`,
        onClick: handleClick,
        'data-bs-toggle': dataBsToggle || undefined,
        'data-bs-placement': dataBsToggle === 'tooltip' ? tooltipPlacement : undefined,
        'data-bs-trigger': dataBsTrigger || undefined,
        'data-bs-target': dataBsTarget || undefined,
        'data-bs-title': tooltipTitle || undefined,
        'data-bs-dismiss': dataBsDismiss || undefined,
        'aria-label': ariaLabel || undefined,
    };

    if (href) {
        if (contentType === 'icon') {
            return (
                <button {...commonProps}>
                    <a href={href} className="text-decoration-none text-white">
                        {props.children}
                    </a>
                </button>
            );
        } else if (contentType === 'text') {
            return (
                <a {...commonProps} href={href}>
                    {props.children}
                </a>
            );
        }
    } else {
        return <button {...commonProps}>{props.children}</button>;
    }
}