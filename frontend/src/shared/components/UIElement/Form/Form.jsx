import React from "react";

export default function Form(props) {
    return (
        <form
            id={props.id}
            className={`${props.mainClass} ${props.addClass}`}
            style={props.style}
            onSubmit={props.onSubmit}
            onAbort={props.onAbort}
            onReset={props.onReset}
            onChange={props.onChange}
            onFocus={props.onFocus}
            onBlur={props.onBlur}
            onInvalid={props.onInvalid}
            onInput={props.onInput}
        >
            {props.children}
        </form>
    )
}