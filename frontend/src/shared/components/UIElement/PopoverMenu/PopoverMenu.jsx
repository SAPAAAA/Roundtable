import React, {useCallback, useEffect, useRef, useState} from 'react';
import './PopoverMenu.css';

/**
 * A popover menu component with a white background.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.trigger - The element that triggers the popover.
 * @param {React.ReactNode} props.children - The content (rows/items). Should be elements like button, a, span, div. Base styling is applied automatically.
 * @param {string} [props.position='bottom-end'] - Popover position ('bottom-start', 'bottom-end', 'top-start', 'top-end').
 * @param {object} [props.menuStyle={}] - Custom inline styles for the popover menu container.
 * @param {boolean} [props.controlledIsOpen] - Optional: Control visibility externally.
 * @param {function} [props.onClose] - Optional: Callback when popover should close (required if controlledIsOpen is used).
 * @param {string} [props.mainClass=''] - Additional class names for the outer container.
 * @param {string} [props.addClass=''] - Additional class names for the popover menu container.
 */
function PopoverMenu(props) {
    const {
        trigger,
        children,
        position = 'bottom-end',
        menuStyle = {},
        controlledIsOpen,
        onClose,
        mainClass = '',
        addClass = '',
    } = props;

    const [isOpenInternal, setIsOpenInternal] = useState(false);
    const triggerRef = useRef(null);
    const menuRef = useRef(null);

    const isControlled = controlledIsOpen !== undefined && onClose !== undefined;
    const isOpen = isControlled ? controlledIsOpen : isOpenInternal;

    const openMenu = useCallback(() => {
        if (!isControlled) setIsOpenInternal(true);
    }, [isControlled]);

    const closeMenu = useCallback(() => {
        if (isControlled) onClose();
        else setIsOpenInternal(false);
    }, [isControlled, onClose]);

    const toggleMenu = useCallback(() => {
        console.log('toggleMenu called. Current isOpen:', isOpen);
        if (isOpen) closeMenu();
        else openMenu();
        console.log('toggleMenu executed. New isOpen:', isOpen);
    }, [isOpen, openMenu, closeMenu]);

    useEffect(() => {
        if (!isOpen) return;

        const handleDocumentClick = (e) => {
            const insideTrigger = triggerRef.current?.contains(e.target);
            const insideMenu = menuRef.current?.contains(e.target);

            if (!insideTrigger && !insideMenu) closeMenu();
        };

        document.addEventListener('click', handleDocumentClick);
        return () => document.removeEventListener('click', handleDocumentClick);
    }, [isOpen, closeMenu]);

    const getPositionStyles = () => {
        const styles = {position: 'absolute', zIndex: 1050};
        const margin = '0.125rem';
        switch (position) {
            case 'bottom-start':
                styles.top = '100%';
                styles.left = '0';
                styles.marginTop = margin;
                break;
            case 'top-start':
                styles.bottom = '100%';
                styles.left = '0';
                styles.marginBottom = margin;
                break;
            case 'top-end':
                styles.bottom = '100%';
                styles.right = '0';
                styles.marginBottom = margin;
                break;
            case 'bottom-end':
            default:
                styles.top = '100%';
                styles.right = '0';
                styles.marginTop = margin;
                break;
        }
        return styles;
    };

    const triggerElement = React.cloneElement(trigger, {
        ref: triggerRef,

        // NEW – prevent the document mousedown listener from ever seeing this press
        onMouseDown: (e) => e.stopPropagation(),

        onClick: (e) => {
            trigger.props.onClick?.(e);   // preserve any original handler
            if (!e.defaultPrevented) {
                toggleMenu();
                e.stopPropagation();        // you already had this
            }
        },
        ariaHaspopup: 'listbox',
        ariaExpanded: isOpen,
    });

    const popoverClasses = `list-group list-group-flush shadow-sm ${addClass}`.trim();

    return (
        <div className={`position-relative d-inline-block ${mainClass}`}>
            {triggerElement}
            {isOpen && (
                <div
                    ref={menuRef}
                    className={`${popoverClasses}`}
                    role="listbox"
                    style={{...getPositionStyles(), minWidth: '180px', ...menuStyle}}
                    aria-labelledby={trigger.props.id}
                >
                    {React.Children.map(children, (child) => {
                        if (!React.isValidElement(child)) {
                            return child; // Return non-elements directly (e.g., text nodes - though usually wrap text)
                        }

                        // Determine base item classes
                        const baseItemClasses = 'list-group-item d-flex flex-row border-0';
                        let actionClass = '';

                        // Add action class for interactive elements (buttons, links)
                        if (typeof child.type === 'string' && ['button', 'a'].includes(child.type.toLowerCase())) {
                            actionClass = 'list-group-item-action';
                        }
                        // Also consider if an onClick is present, even on a div/span
                        else if (child.props.onClick) {
                            actionClass = 'list-group-item-action';
                        }

                        // Combine classes: base + action (if any) + existing child classes
                        const existingClasses = child.props.className || '';
                        const finalClassName = `${baseItemClasses} ${actionClass} ${existingClasses}`
                            .trim() // Remove leading/trailing spaces
                            .replace(/\s+/g, ' '); // Replace multiple spaces with single

                        console.log(finalClassName)

                        // Clone with merged classes, role, and onClick wrapper
                        return React.cloneElement(child, {
                            className: finalClassName,
                            // role: 'option', // Assign role if needed, might be implicit
                            onClick: (e) => {
                                // Execute original onClick if it exists
                                if (child.props.onClick) {
                                    child.props.onClick(e);
                                }
                                // Close menu if default wasn't prevented
                                if (!e.defaultPrevented && actionClass) { // Only auto-close actionable items
                                    closeMenu();
                                }
                            }
                        });
                    })}
                </div>
            )}
        </div>
    );
}

export default PopoverMenu;