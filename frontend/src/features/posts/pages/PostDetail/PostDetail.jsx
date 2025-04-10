import React, {useState,useEffect} from "react";
import "./PostDetail.css"
import Avatar from "@shared/components/UIElement/Avatar/Avatar";
import Identifier from "@shared/components/UIElement/Identifier/Identifier";
import Button from "@shared/components/UIElement/Button/Button";
import Icon from "@shared/components/UIElement/Icon/Icon";
import {useVote} from "@features/posts/hooks/vote-hook.jsx";
import WriteComment from "@features/posts/components/WriteComment/WriteComment.jsx";
import Comment from "@features/posts/components/Comment/Comment.jsx";
import { use } from "react";

export default function PostDetail(props) {
    const {
        voteStatus,
        voteCount,
        isVoting,
        voteError,
        handleUpvote,
        handleDownvote
    } = useVote(
        {initialCount: props.post.upvotes, initialVoteStatus: null}, // Adjust initialVoteStatus if known
        props.post.id
    );
   

    const handleShare = () => {
        const currentUrl = window.location.href;
        navigator.clipboard.writeText(currentUrl)
            .then(() => {
                console.log("Link copied!");
            })
            .catch(err => console.error("Error copying link:", err));
    };

    // const handleSetWrite =()=>{
    //     setWrite(true)
    //     //console.log(write);
        
    // }
    const [Input, setInput] = useState(false);
    const [items, setItems] = useState(props.comments.filter(comment => comment.parentId === null).map(() => ({ isOpen: false })));
    const toggleWriteOpen = (index,state) => {
        setItems(prev =>
            prev.map((item, i) =>
                i === index ? { ...item, isOpen: state } : { ...item, isOpen: !state }
            )
        );
    };
    const toggWriteClose = (index,state) =>{
        setItems(prev =>
            prev.map((item, i) =>
                i === index ? { ...item, isOpen: state } : item
            )
        );
    }
    const setAll = (value) => {
        setItems(prev => prev.map(item => ({ ...item, isOpen: value })));
    };
    const setSubmit = (e) =>{
        e.currentTarget.disabled = true;
        setInput(false)
    }
    // useEffect(() => {
    //     if (Input) {
    //         setAll(false); // ✅ tắt reply khi mở input chính
    //     }
    // }, [Input]);


    return (
        <>
            <div className="p-3 my-3">
                {/* Subreddit Info */}
                <div className="d-flex align-items-center mb-2 justify-content-between">
                    <div className="d-flex align-items-center">
                        <Button href='/' contentType="icon">
                            <Icon
                                mainClass="back-icon"
                                name="Arrow_left"
                                size="15px"/>
                        </Button>
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
                        <div className="dropdown">
                            <Button
                                contentType="icon"
                                dataBsToggle="dropdown"
                                aria-expanded="false"
                                padding="2"
                            >
                                <Icon
                                    mainClass="option-icon"
                                    name="three_dots"
                                    size="15px"/>
                            </Button>
                            <ul className="dropdown-menu">
                                <li><Button addClass="dropdown-item d-flex align-items-center">
                                    <Icon
                                        addClass="me-2"
                                        name="save"
                                        size="15px"/>
                                    Lưu
                                </Button>
                                </li>
                                <li><Button addClass="dropdown-item d-flex align-items-center">
                                    <Icon
                                        addClass="me-2"
                                        name="hide"
                                        size="15px"/>
                                    Ẩn
                                </Button></li>
                                <li><Button addClass="dropdown-item d-flex align-items-center">
                                    <Icon
                                        addClass="me-2"
                                        name="report"
                                        size="15px"
                                    />
                                    Báo cáo
                                </Button></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Post Title */}
                <h5 className="fw-bold">{props.post.title}</h5>

                {/* Post Content */}
                {/* Use dangerouslySetInnerHTML only if props.post.content contains trusted HTML */}
                {/* Otherwise, render as text or use a safe HTML renderer */}
                <p>{props.post.content}</p>

                {/* Post Actions */}
                <div className="d-flex align-items-center gap-2 mb-3">
                    {voteError && <div className="text-danger fs-8 me-2">Error: {voteError}</div>}
                    <div
                        className={`vote-container ${voteStatus || ''} d-flex align-items-center rounded-pill gap-2 bg-light`}
                    >
                        <Button
                            mainClass="upvote-button"
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
                            mainClass="downvote-button"
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
                    <div className="comment-container d-flex align-items-center rounded-pill gap-2 bg-light p-2">
                        <Button
                            mainClass="comment-btn"
                            contentType="icon"
                            //onClick={() => setInput(true)}
                        >
                            <Icon
                                mainClass="comment-icon"
                                name="comment"
                                size="15px"/>
                        </Button>
                        {/* <span className="fs-8">{props.comments?.length || 0}</span> */}
                    </div>
                    <div className="share-container d-flex align-items-center rounded-pill gap-2 bg-light p-2">
                        <Button
                            mainClass="share-btn"
                            contentType="icon"
                            dataBsToggle="tooltip"
                            dataBsTrigger="hover focus"
                            tooltipTitle="Share"
                            tooltipPlacement="top"
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
                        src = "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=100&q=80"
                        time= "2 min. ago"
                        parentId = {null}
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
                                .map((comment,index) =>
                                    (
                                        
                                        <div key={comment.id} className="mb-3">
                                                <Comment comment={comment} checkparent={true} setWrite={() => {
                                                    toggleWriteOpen(index,true);
                                                    setInput(false);}}/>
                                                {
                                                    items[index]?.isOpen && (<WriteComment 
                                                    postId={props.post.id}
                                                    username="le van viet hoang"
                                                    src="https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=100&q=80"
                                                    time="3 min. ago"
                                                    parentId={comment.id}
                                                    setInput={toggWriteClose}  
                                                    setIndex={index}
                                                    //onCommentSubmit={() => toggWriteClose(index,false)}
                                                    onCancel={() => toggWriteClose(index,false)}/>)
                                                }
                                            {   props.comments
                                                    .filter(child => child.parentId === comment.id)
                                                    .map(child => (
                                                        <div key={child.id} className="ms-4 border-start ps-3 mt-2">
                                                            <Comment comment={child} checkparent={false} />
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