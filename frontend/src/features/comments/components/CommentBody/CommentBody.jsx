import React from 'react';

export default function CommentBody({body}) {
    return (
        <div
            className="fs-content mt-2 mb-2"
            dangerouslySetInnerHTML={{__html: body}}
        />
    );
}