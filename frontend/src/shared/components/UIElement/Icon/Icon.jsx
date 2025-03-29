import React from 'react';
import './Icon.css';

export default function Icon(props) {
    const style = {
        width: props.size,
        height: props.size,
    };

    switch (props.name) {
        case "menu":
            return (
                <svg xmlns="http://www.w3.org/2000/svg"
                     viewBox="0 0 16 16"
                     className={`${props.mainClass} icon ${props.addClass}`}
                     style={style}
                     id={props.id}>
                    <path
                        fillRule="evenodd"
                        d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5
               m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5
               m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
                    />
                </svg>
            );

        case "chat":
            return (
                <svg xmlns="http://www.w3.org/2000/svg"
                     viewBox="0 0 16 16"
                     className={`${props.mainClass} icon ${props.addClass}`}
                     style={style}
                     id={props.id}>
                    <path
                        d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                    <path
                        d="M5 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
                </svg>
            );

        case "bell":
            return (
                <svg xmlns="http://www.w3.org/2000/svg"
                     viewBox="0 0 16 16"
                     className={`${props.mainClass} icon ${props.addClass}`}
                     style={style}
                     id={props.id}>
                    <path
                        d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6"/>
                </svg>
            );

        case "upvote":
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    shapeRendering="geometricPrecision"
                    textRendering="geometricPrecision"
                    imageRendering="optimizeQuality"
                    fillRule="evenodd"
                    clipRule="evenodd"
                    viewBox="0 0 512 308.047"
                    className={`${props.mainClass} icon ${props.addClass}`}
                    style={style}
                    id={props.id}>
                    <path
                        fillRule="nonzero"
                        d="m450.9 351.53-389.74.01v.09c-16.41 0-30.47-6.18-41.02-15.86h-.09c-6.33-5.81-11.35-12.95-14.77-20.78C1.84 307.13 0 298.65 0 290.15c0-14.33 5.02-28.92 16.13-41.03L210.68 22.07a57.61 57.61 0 0 1 6.7-6.97l1.64-1.31C230.05 4.71 243.53.14 257.04 0c14.12-.13 28.27 4.56 39.71 14.01 2.26 1.87 4.57 4.13 6.91 6.77l193.28 229.59.07-.06c10.35 11.88 14.97 25.9 14.99 39.72 0 8.93-1.98 17.71-5.62 25.65-3.7 8.07-9.01 15.31-15.63 21.07-10.4 9.05-24.08 14.76-39.85 14.78zM61.16 306.95l389.74-.01c4.09 0 7.71-1.53 10.48-3.94 1.93-1.69 3.45-3.7 4.43-5.85 1.04-2.27 1.6-4.71 1.6-7.12 0-3.43-1.29-7.06-4.15-10.35l.08-.06c-64.75-74.39-127.05-157.15-193.08-229.29-.46-.51-1.15-1.15-2.02-1.87-3.15-2.6-7.03-3.91-10.85-3.87-3.4.03-6.8 1.13-9.62 3.3l-.84.77c-.65.57-1.26 1.21-1.83 1.9C183.64 110.79 107.71 210.97 49 279.37c-2.91 3.18-4.24 7.01-4.24 10.78 0 2.49.51 4.88 1.43 7.01a17.35 17.35 0 0 0 4.1 5.74l-.04.04c2.64 2.4 6.35 3.92 10.91 3.92v.09z"/>
                </svg>

            );

        case "upvoted":
            return (
                <svg xmlns="http://www.w3.org/2000/svg"
                     shapeRendering="geometricPrecision"
                     textRendering="geometricPrecision"
                     imageRendering="optimizeQuality"
                     fillRule="evenodd"
                     clipRule="evenodd"
                     viewBox="0 0 512.01 336.37"
                     className={`${props.mainClass} icon ${props.addClass}`}
                     style={style}
                     id={props.id}>
                    <path
                        fillRule="nonzero"
                        d="M469.51 336.37H42.47c-9.9-.03-19.84-3.47-27.89-10.47-17.68-15.4-19.55-42.24-4.15-59.92L229.45 14.56c1.51-1.7 3.17-3.33 4.98-4.82 18.06-14.93 44.83-12.41 59.76 5.65l206.65 249.76a42.308 42.308 0 0 1 11.17 28.71c0 23.47-19.03 42.51-42.5 42.51z"/>
                </svg>
            );

        case "downvote":
            return (
                <svg xmlns="http://www.w3.org/2000/svg"
                     shapeRendering="geometricPrecision"
                     textRendering="geometricPrecision"
                     imageRendering="optimizeQuality"
                     fillRule="evenodd"
                     clipRule="evenodd"
                     viewBox="0 0 512 351.63"
                     className={`${props.mainClass} icon ${props.addClass}`}
                     style={style}
                     id={props.id}>
                    <path fillRule="nonzero"
                          d="M450.9.1 61.16.09V0C44.75 0 30.69 6.18 20.14 15.86h-.09C13.72 21.67 8.7 28.8 5.28 36.63 1.84 44.49 0 52.98 0 61.48 0 75.8 5.02 90.4 16.13 102.51l194.55 227.04c2.08 2.57 4.33 4.89 6.7 6.98l1.64 1.31c11.03 9.07 24.51 13.65 38.02 13.78 14.12.14 28.27-4.56 39.71-14.01 2.26-1.87 4.57-4.12 6.91-6.76l193.28-229.6.07.06c10.35-11.88 14.97-25.9 14.99-39.71 0-8.93-1.98-17.71-5.62-25.65-3.7-8.07-9.01-15.31-15.63-21.07C480.35 5.83 466.67.12 450.9.1zM61.16 44.67l389.74.01c4.09 0 7.71 1.54 10.48 3.95 1.93 1.68 3.45 3.7 4.43 5.85 1.04 2.26 1.6 4.71 1.6 7.12 0 3.42-1.29 7.06-4.15 10.34l.08.06c-64.75 74.4-127.05 157.16-193.08 229.3-.46.51-1.15 1.15-2.02 1.87-3.15 2.6-7.03 3.91-10.85 3.87-3.4-.03-6.8-1.13-9.62-3.3l-.84-.78c-.65-.57-1.26-1.21-1.83-1.89C183.64 240.84 107.71 140.66 49 72.26c-2.91-3.18-4.24-7.02-4.24-10.78 0-2.49.51-4.88 1.43-7.01.94-2.14 2.33-4.12 4.1-5.74l-.04-.04c2.64-2.4 6.35-3.93 10.91-3.93v-.09z"/>
                </svg>
            );

        case "downvoted":
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    shapeRendering="geometricPrecision"
                    textRendering="geometricPrecision"
                    imageRendering="optimizeQuality"
                    fillRule="evenodd"
                    clipRule="evenodd"
                    viewBox="0 0 512 336.36"
                    className={`${props.mainClass} icon ${props.addClass}`}
                    style={style}
                    id={props.id}>
                    <path
                        fillRule="nonzero"
                        d="M42.47.01 469.5 0C492.96 0 512 19.04 512 42.5c0 11.07-4.23 21.15-11.17 28.72L294.18 320.97c-14.93 18.06-41.7 20.58-59.76 5.65-1.8-1.49-3.46-3.12-4.97-4.83L10.43 70.39C-4.97 52.71-3.1 25.86 14.58 10.47 22.63 3.46 32.57.02 42.47.01z"/>
                </svg>
            );

        case "comment":
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    className={`${props.mainClass} icon ${props.addClass}`}
                    style={style}
                    id={props.id}
                    viewBox="0 0 16 16">
                    <path
                        d="M16 8c0 3.866-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7M5 8a1 1 0 1 0-2 0 1 1 0 0 0 2 0m4 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0m3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/>
                </svg>
            );
        case "share":
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    className={`${props.mainClass} icon ${props.addClass}`}
                    style={style}
                    id={props.id}>
                    <path
                        d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.5 2.5 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5m-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3"/>
                </svg>
            );

        default:
            return null;
    }
}