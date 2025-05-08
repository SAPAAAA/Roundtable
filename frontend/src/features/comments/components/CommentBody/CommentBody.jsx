import React from 'react';

export default function CommentBody({body}) {
    // Using dangerouslySetInnerHTML assumes the body content is sanitized on the backend
    // or comes from a trusted source. Be cautious with this approach.
    return (
        <div
            className="fs-content mt-2 mb-2"
            dangerouslySetInnerHTML={{__html: body}}
        />
    );
}