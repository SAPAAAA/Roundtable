import React, {useEffect, useRef} from 'react';
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
        tooltipInstance.current?.hide();
    };

    // Build dynamic class names
    const outlineClass = props.outline
        ? `btn-outline-${props.outline.color}${props.outline.depth ? ` btn-outline-depth-${props.outline.depth}` : ''}`
        : '';

    const backgroundClass = props.background
        ? `bg-${props.background.color}`
        : '';

    // Use the passed padding prop or default to "p-2"
    const paddingClass = props.padding ? props.padding : "2";

    const commonProps = {
        id: props.id,
        ref: buttonRef,
        className: `${props.mainClass || ''} btn btn-hover ${props.contentType === 'icon' ? 'btn-icon' : ''} ${outlineClass} ${backgroundClass} rounded-pill d-flex justify-content-center align-items-center p-${paddingClass} ${props.addClass || ''}`,
        onClick: handleClick,
        'data-bs-toggle': props.tooltip ? 'tooltip' : undefined,
        'data-bs-placement': props.tooltip ? props.tooltipPlacement || 'top' : undefined,
        'data-bs-trigger': props.tooltip ? 'hover focus' : undefined,
        'data-bs-title': props.tooltip || undefined
    };

    if (props.href) {
        if (props.contentType === 'icon') {
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


// export default function Button(props) {
//     const buttonRef = useRef(null);
//     const tooltipInstance = useRef(null);
//
//     useEffect(() => {
//         if (props.tooltip && window.bootstrap && buttonRef.current) {
//             tooltipInstance.current = new window.bootstrap.Tooltip(buttonRef.current, {
//                 title: props.tooltip,
//                 placement: props.tooltipPlacement || 'top',
//                 trigger: 'hover focus',
//                 container: 'body'  // Ensure tooltip is appended to body
//             });
//         }
//         return () => {
//             tooltipInstance.current?.dispose();
//         };
//     }, [props.tooltip, props.tooltipPlacement]);
//
//
//     const handleClick = (e) => {
//         props.onClick?.(e);
//         setTimeout(() => {
//             tooltipInstance.current?.hide();
//         }, 0);
//     };
//
//
//     // Build dynamic class names
//     const outlineClass = props.outline
//         ? `btn-outline-${props.outline.color}${props.outline.depth ? ` btn-outline-depth-${props.outline.depth}` : ''}`
//         : '';
//
//     const backgroundClass = props.background
//         ? `bg-${props.background.color}`
//         : '';
//
//     const isDropdown = props.dropdown && props.dropdownItems?.length;
//
//     const baseClasses = [
//         'btn',
//         'btn-hover',
//         props.contentType === 'icon' ? 'btn-icon' : '',
//         outlineClass,
//         backgroundClass,
//         'rounded-pill',
//         'd-flex',
//         'justify-content-center',
//         'align-items-center',
//         'p-2',
//         props.className || '',
//         isDropdown ? 'dropdown-toggle' : ''
//     ].join(' ').trim();
//
//     // Always assign dropdown toggle when needed.
//     const commonProps = {
//         id: props.id,
//         ref: buttonRef,
//         className: baseClasses,
//         onClick: handleClick,
//         // For dropdowns, always use "dropdown" as the toggle.
//         'data-bs-toggle': isDropdown ? 'dropdown' : undefined,
//         // Tooltip options are handled in the JS initialization, so no tooltip data attributes here.
//         'aria-expanded': isDropdown ? 'false' : undefined,
//         'role': isDropdown ? 'button' : undefined
//     };
//
//     if (isDropdown) {
//         if (props.href) {
//             return (
//                 <div className="dropdown-center">
//                     <a {...commonProps} href={props.href || '#'} className={`nav-link ${baseClasses}`}>
//                         {props.children}
//                     </a>
//                     <ul className="dropdown-menu">
//                         {props.dropdownItems.map((item, index) => (
//                             <li key={index}>
//                                 <a className="dropdown-item" href={item.href || '#'} onClick={item.onClick}>
//                                     {item.label}
//                                 </a>
//                             </li>
//                         ))}
//                     </ul>
//                 </div>
//             );
//         } else {
//             return (
//                 <div className="dropdown-center">
//                     <button {...commonProps}>
//                         {props.children}
//                     </button>
//                     <ul className="dropdown-menu">
//                         {props.dropdownItems.map((item, index) => (
//                             <li key={index}>
//                                 <a className="dropdown-item" href={item.href || '#'} onClick={item.onClick}>
//                                     {item.label}
//                                 </a>
//                             </li>
//                         ))}
//                     </ul>
//                 </div>
//             );
//         }
//     }
//
//     if (props.href) {
//         // Use <a> tag when href is provided
//         return (
//             <a {...commonProps} href={props.href}>
//                 {props.children}
//             </a>
//         );
//     } else {
//         return (
//             <button {...commonProps}>
//                 {props.children}
//             </button>
//         );
//     }
// }
