import React from 'react';
import './Avatar.css';

export default function Avatar(props) {
    return (
        <img
            src={props.src}
            alt={props.alt}
            className={`${props.mainClass} avatar rounded-circle ${props.addClass}`}
            width={props.width}
            height={props.height}
            style={props.style}
        />
    );
}