import React from 'react';
import './Avatar.css';

export default function Avatar(props) {
    return (
        <img
            src={props.src}
            alt={props.alt}
            className={`avatar rounded-circle ${props.className}`}
            width={props.width}
            height={props.height}
            style={props.style}
        />
    );
}