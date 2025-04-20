// #features/posts/components/PostHeaderDetailed/PostHeaderDetailed.jsx
import React from "react";
import Avatar from "#shared/components/UIElement/Avatar/Avatar";
import Identifier from "#shared/components/UIElement/Identifier/Identifier";
import Button from "#shared/components/UIElement/Button/Button";
import Icon from "#shared/components/UIElement/Icon/Icon";
import PostOptions from "#features/posts/components/PostOptions/PostOptions"; // Import the options component
import "./PostHeaderDetailed.css";
import {formatTimeAgo} from "../../../../utils/time.js";

export default function PostHeaderDetailed(props) {
    const {subtable, post, author, onBackClick, onOptions /* pass specific handlers */} = props;

    // Placeholder handlers for options
    const handleSave = () => console.log("Detailed Save clicked");
    const handleHide = () => console.log("Detailed Hide clicked");
    const handleReport = () => console.log("Detailed Report clicked");


    // Function to handle navigation back
    const handleBack = () => {
        if (onBackClick) {
            onBackClick();
        } else {
            // Default browser back if no handler provided
            window.history.back();
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-between mb-2">
            {/* Left side: Back Button, Subtable Info, User */}
            <div className="d-flex align-items-center">
                <Button
                    contentType="icon"
                    roundedPill
                    ariaLabel="Back"
                    onClick={handleBack}
                    mainClass="back-btn"
                    addClass="me-2"
                    padding="1"
                >
                    <Icon mainClass="back-icon" name="arrow_left" size="18px"/> {/* Slightly larger icon */}
                </Button>
                <Avatar
                    src={subtable.icon}
                    alt={`r/${subtable.name}`}
                    width={20}
                    height={20}/>
                <div className="ms-2 fs-8 lh-sm d-flex flex-row flex-wrap">
                    <div className="d-flex flex-column"> {/* Use flex-column for stacking */}
                        <div>
                            <Identifier
                                addClass="fw-bold" // Make subtable name bold
                                type="subtable"
                                namespace={subtable.name}/>

                        </div>
                        {/* Display username on the next line */}
                        <span className="text-muted">{author.displayName}</span>
                    </div>
                    &nbsp;•&nbsp;
                    <span className="text-muted">{formatTimeAgo(post.createdAt)}</span>
                </div>
            </div>

            {/* Right side: Options Button Only */}
            {/* Use the PostOptions component */}
            <PostOptions
                onSave={handleSave}
                onHide={handleHide}
                onReport={handleReport}
            />
        </div>
    );
}