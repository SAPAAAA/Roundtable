import React from 'react';
import './Link.css';

export default function Link(props) {
    const {href, children, className, ...rest} = props;

    return (
        <a
            href={href}
            className={`link ${className}`}
            {...rest}
        >
            {children}
        </a>
    );
}