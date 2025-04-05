import React from 'react';
import './Link.css';

export default function Link(props) {
    const {href, children, className = '', isDropdown, ...rest} = props;

    const classes = `link text-decoration-none ${isDropdown !== undefined ? 'dropdown-item' : ''} ${className}`.trim();

    return (
        <a
            href={href}
            className={classes}
            {...rest}
        >
            {children}
        </a>
    );
}
