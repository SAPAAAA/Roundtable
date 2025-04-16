import React, {useState} from "react";
import "./PostDetail.css"
import Avatar from "#shared/components/UIElement/Avatar/Avatar";
import Identifier from "#shared/components/UIElement/Identifier/Identifier";
import Button from "#shared/components/UIElement/Button/Button";
import Icon from "#shared/components/UIElement/Icon/Icon";
import PopoverMenu from "#shared/components/UIElement/PopoverMenu/PopoverMenu";
import {useVote} from "#features/posts/hooks/vote-hook.jsx";
import WriteComment from "#features/posts/components/WriteComment/WriteComment.jsx";
import Comment from "#features/posts/components/Comment/Comment.jsx";

export default function PostDetail(props) {
    const {
        voteStatus,
        voteCount,
        isVoting,
        voteError,
        handleUpvote,
        handleDownvote
    } = useVote(
        {initialCount: props.post.upvotes, initialVoteStatus: null},
        props.post.id
    );

    const handleShare = () => {
        const currentUrl = window.location.href;
        navigator.clipboard.writeText(currentUrl)
            .then(() => {
                console.log("Link copied!");
                // Maybe add user feedback here (e.g., toast notification)
            })
            .catch(err => console.error("Error copying link:", err));
    };

    // Action Handlers for Popover Items (Example)
    const handleSavePost = () => {
        console.log("Save action triggered");
        // Add actual save logic here
    };
    const handleHidePost = () => {
        console.log("Hide action triggered");
        // Add actual hide logic here
    };
    const handleReportPost = () => {
        console.log("Report action triggered");
        // Add actual report logic here
    };


    const [Input, setInput] = useState(false);
    const [items, setItems] = useState(props.comments.filter(comment => comment.parentId === null).map(() => ({isOpen: false})));
    const toggleWriteOpen = (index, state) => {
        setItems(prev =>
            prev.map((item, i) =>
                i === index ? {...item, isOpen: state} : {...item, isOpen: !state}
            )
        );
    };
    const toggleWriteClose = (index, state) => {
        setItems(prev =>
            prev.map((item, i) =>
                i === index ? {...item, isOpen: state} : item
            )
        );
    }
    const setAll = (value) => {
        setItems(prev => prev.map(item => ({...item, isOpen: value})));
    };
    const setSubmit = (e) => {
        e.currentTarget.disabled = true;
        setInput(false)
    }

    return (
        <>
            <div className="p-3 my-3">
                {/* Subreddit Info */}
                <div className="d-flex align-items-center mb-2 justify-content-between">
                    <div className="d-flex align-items-center">
                        <Button href='/' contentType="icon">
                            <Icon
                                mainClass="back-icon"
                                name="arrow_left"
                                size="15px"/>
                        </Button>
                        &nbsp;
                        <Avatar
                            src={props.post.subtable.avatar.src}
                            alt={`r/${props.post.subtable.namespace}`}
                            width={20}
                            height={20}/>
                        <div className="d-flex flex-row flex-wrap fs-8">
                            <Identifier
                                addClass="underline ms-2"
                                type="subtable"
                                namespace={props.post.subtable.namespace}/>
                            &nbsp;•&nbsp;
                            <span className="text-muted">{props.post.time}</span>
                            {props.post.username && <div className="w-100 underline ms-2">{props.post.username}</div>}
                        </div>
                    </div>

                    <div className="option-container d-flex align-items-center rounded-pill gap-2 bg-light">
                        <PopoverMenu
                            mainClass="option-menu"
                            addClass="bg-white rounded"
                            position="bottom-end"
                            trigger={
                                <Button
                                    mainClass="option-btn"
                                    contentType="icon"
                                    padding="2"
                                    ariaLabel="Post Options"
                                >
                                    <Icon
                                        mainClass="option-icon"
                                        name="three_dots"
                                        size="15px"/>
                                </Button>
                            }
                        >
                            <Button
                                mainClass="save-btn"
                                type="button"
                                justifyContent="start"
                                rounded={false}
                                onClick={handleSavePost}
                            >
                                <Icon
                                    addClass="me-2"
                                    name="floppy"
                                    size="15px"/>
                                <span>Lưu</span>
                            </Button>
                            <Button
                                mainClass="hide-btn"
                                type="button"
                                justifyContent="start"
                                rounded={false}
                                onClick={handleHidePost}
                            >
                                <Icon
                                    addClass="me-2"
                                    name="hide"
                                    size="15px"/>
                                <span>Ẩn</span>
                            </Button>
                            <Button
                                mainClass="report-btn"
                                type="button"
                                justifyContent="start"
                                rounded={false}
                                onClick={handleReportPost}
                            >
                                <Icon
                                    addClass="me-2"
                                    name="flag"
                                    size="15px"
                                />
                                <span>Báo cáo</span>
                            </Button>
                            {/* You could add an <hr className="my-1 mx-3" /> here if needed */}
                        </PopoverMenu>
                    </div>
                </div>

                {/* Post Title */}
                <h5 className="fw-bold">{props.post.title}</h5>

                {/* Post Content */}
                {/* Use dangerouslySetInnerHTML only if props.post.content contains trusted HTML */}
                {/* Otherwise, render as text or use a safe HTML renderer */}
                <p>{props.post.content}</p>

                {/* Post Actions */}
                <div className="post-actions-container d-flex align-items-center gap-2 mb-3">
                    {voteError && <div className="text-danger fs-8 me-2">Error: {voteError}</div>}
                    <div
                        className={`post-actions vote-container ${voteStatus || ''} d-flex align-items-center rounded-pill gap-2 bg-white`}
                    >
                        <Button
                            mainClass="upvote-btn"
                            contentType="icon"
                            dataBsToggle="tooltip"
                            dataBsTrigger="hover focus"
                            tooltipTitle="Upvote"
                            tooltipPlacement="top"
                            padding="2"
                            onClick={handleUpvote}
                            disabled={isVoting}
                        >
                            <Icon
                                mainClass="upvote-icon"
                                name={voteStatus === "upvoted" ? "upvoted" : "upvote"}
                                size="15px"/>
                        </Button>
                        <span className="fs-8">{voteCount}</span>
                        <Button
                            mainClass="downvote-btn"
                            contentType="icon"
                            dataBsToggle="tooltip"
                            dataBsTrigger="hover focus"
                            tooltipTitle="Downvote"
                            tooltipPlacement="top"
                            padding="2"
                            onClick={handleDownvote}
                            disabled={isVoting}
                        >
                            <Icon
                                mainClass="downvote-icon"
                                name={voteStatus === "downvoted" ? "downvoted" : "downvote"}
                                size="15px"/>
                        </Button>
                    </div>
                    <div className="post-actions share-container d-flex align-items-center rounded-pill gap-2 bg-white">
                        <Button
                            mainClass="share-btn"
                            contentType="icon"
                            dataBsToggle="tooltip"
                            dataBsTrigger="hover focus"
                            tooltipTitle="Share"
                            tooltipPlacement="top"
                            padding="2"
                            onClick={handleShare}
                        >
                            <Icon
                                mainClass="share-icon"
                                name="share"
                                size="15px"/>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Comment Input Area */}
            <div className="mb-3 px-3">
                {
                    Input === false ? (
                        <input
                            type="text"
                            className="form-control rounded-pill small-placeholder"
                            placeholder="Thêm bình luận" onClick={() => {
                            setInput(true);
                            setAll(false)
                        }}/>
                    ) : (
                        <>
                            <WriteComment
                                postId={props.post.id}
                                username="Mai Đức Kiên"
                                src="https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=100&q=80"
                                time="2 min. ago"
                                parentId={null}
                                setInput={setInput}
                                // onCommentSubmit={setSubmit}
                                onCancel={() => setInput(false)}/>
                        </>

                    )
                }
            </div>

            {/* Comment Section */}
            {
                props.comments && props.comments.length > 0 && (
                    <div className="px-3">
                        {
                            props.comments
                                .filter(comment => comment.parentId === null)
                                .map((comment, index) =>
                                    (

                                        <div key={comment.id} className="mb-3">
                                            <Comment comment={comment} checkparent={true} setWrite={() => {
                                                toggleWriteOpen(index, true);
                                                setInput(false);
                                            }}/>
                                            {
                                                items[index]?.isOpen && (<WriteComment
                                                    postId={props.post.id}
                                                    username="le van viet hoang"
                                                    src="https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=100&q=80"
                                                    time="3 min. ago"
                                                    parentId={comment.id}
                                                    setInput={toggleWriteClose}
                                                    setIndex={index}
                                                    //onCommentSubmit={() => toggleWriteClose(index,false)}
                                                    onCancel={() => toggleWriteClose(index, false)}/>)
                                            }
                                            {props.comments
                                                    .filter(child => child.parentId === comment.id)
                                                    .map(child => (
                                                        <div key={child.id} className="ms-4 border-start ps-3 mt-2">
                                                            <Comment comment={child} checkparent={false}/>
                                                        </div>
                                                    ))
                                            }

                                        </div>
                                    )
                                )
                        }
                    </div>)
            }
        </>
    );
}