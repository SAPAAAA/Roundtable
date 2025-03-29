import React from 'react';
import './Identifier.css';

export default function Identifier(props) {
    const getTypeAbbreviation = (type) => {
        switch (type) {
            case 'subtable':
                return 's';
            case 'username':
                return 'u';
            default:
                return '';
        }
    };

    return (
        <div
            id={props.id}
            className={`${props.mainClass} identifier ${props.addClass}`}
            style={props.style}
        >
            {getTypeAbbreviation(props.type)}/{props.namespace}
        </div>
    );
}