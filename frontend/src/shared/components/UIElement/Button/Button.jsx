import React, { useEffect, useRef } from 'react';
import './Button.css';

export default function Button(props) {
    const buttonRef = useRef(null);
    const tooltipInstance = useRef(null);

    useEffect(() => {
        if (props.tooltip && window.bootstrap && buttonRef.current) {
            tooltipInstance.current = new window.bootstrap.Tooltip(buttonRef.current);
        }

        return () => {
            tooltipInstance.current?.dispose();
        };
    }, [props.tooltip]);

    const handleClick = (e) => {
        props.onClick?.(e);
        // Hide tooltip after click
        tooltipInstance.current?.hide();
    };

    const commonProps = {
        id: props.id,
        ref: buttonRef,
        className: `btn btn-hover ${props.type === 'icon' ? 'btn-icon' : ''} rounded-pill d-flex justify-content-center align-items-center p-2 ${props.className}`,
        onClick: handleClick,
        'data-bs-toggle': props.tooltip ? 'tooltip' : undefined,
        'data-bs-placement': props.tooltip ? props.tooltipPlacement || 'top' : undefined,
        'data-bs-trigger': props.tooltip ? 'hover focus' : undefined,
        'data-bs-title': props.tooltip || undefined
    };

    if (props.href) {
        if (props.type === 'icon') {
            return (
                <button {...commonProps}>
                    <a href={props.href} className="text-decoration-none text-white">
                        {props.children}
                    </a>
                </button>
            );
        } else {
            return (
                <a {...commonProps} href={props.href}>
                    {props.children}
                </a>
            );
        }
    } else {
        return <button {...commonProps}>{props.children}</button>;
    }
}
