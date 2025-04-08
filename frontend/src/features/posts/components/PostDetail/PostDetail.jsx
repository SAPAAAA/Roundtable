import React, {useState} from "react";
import "./PostDetail.css"
import Avatar from "@shared/components/UIElement/Avatar/Avatar";
import Identifier from "@shared/components/UIElement/Identifier/Identifier";
import Button from "@shared/components/UIElement/Button/Button";
import Icon from "@shared/components/UIElement/Icon/Icon";
import {useVote} from "../PostPreview/vote-hook";
import WriteComment from "../WriteComment/WriteComment";
import Comment from "../Comment/Comment";

export default function PostDetail(props) {
    const {
        voteStatus,
        voteCount,
        handleUpvote,
        handleDownvote
    } = useVote(props.post.upvotes);
    const handleShare = () => {
        const currentUrl = window.location.href; // Lấy URL hiện tại
        navigator.clipboard.writeText(currentUrl) // Sao chép vào clipboard
            .then(() => {
                //alert("Link đã được sao chép!")
                // setTimeout(() => setShowAlert(false), 3000); // Ẩn sau 3 giây

            })
            .catch(err => console.error("Lỗi khi sao chép link:", err));
    };
    const [Input, setInput] = useState(false)
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
                                addClass="underline"
                                type="subtable"
                                namespace={props.post.subtable.namespace}/>
                            &nbsp;•&nbsp;
                            <span className="text-muted">{props.post.time}</span>
                            <div className="w-100 underline">{props.post.username}</div>
                        </div>
                    </div>

                    <div className="option-container d-flex align-items-center rounded-pill gap-2 bg-light">
                        <div className="dropdown">
                            <Button

                                contentType="icon"
                                dataBsToggle="dropdown"
                                dataBsTrigger="hover focus"
                                tooltipTitle="Options"
                                tooltipPlacement="top"
                                padding="2"
                            >
                                <Icon
                                    mainClass="option-icon"
                                    name="three_dots"
                                    size="15px"/>
                            </Button>
                            <ul class="dropdown-menu">
                                <li><Button addClass="w-100">
                                    <Icon
                                        addClass="me-3"
                                        name="Save"
                                        size="15px"/>
                                    Lưu
                                </Button>
                                </li>

                                <li><Button addClass="w-100">
                                    <Icon
                                        addClass="me-3"
                                        name="Hide"
                                        size="15px"/>
                                    Ẩn
                                </Button></li>
                                <li><Button addClass="w-100">
                                    <Icon
                                        addClass="me-3"
                                        //mainClass="save-icon"
                                        name="Report"
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
                <p>{props.post.content}</p>

                {/* Post Actions */}
                <div className="d-flex align-items-center gap-2 mb-3">
                    <div
                        className={`vote-container ${voteStatus} d-flex align-items-center rounded-pill gap-2 bg-light`}>
                        <Button
                            mainClass="upvote-button"
                            contentType="icon"
                            dataBsToggle="tooltip"
                            dataBsTrigger="hover focus"
                            tooltipTitle="Upvote"
                            tooltipPlacement="top"
                            padding="2"
                            onClick={handleUpvote}
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
                        >
                            <Icon
                                mainClass="downvote-icon"
                                name={voteStatus === "downvoted" ? "downvoted" : "downvote"}
                                size="15px"/>
                        </Button>
                    </div>
                    <div className="comment-container d-flex align-items-center rounded-pill gap-2 bg-light">
                        <Button
                            contentType="icon"
                            dataBsToggle="tooltip"
                            dataBsTrigger="hover focus"
                            tooltipTitle="Comment"
                            tooltipPlacement="top"
                            padding="2"
                        >
                            <Icon
                                mainClass="comment-icon"
                                name="comment"
                                size="15px"/>
                        </Button>
                    </div>
                    <div className="share-container d-flex align-items-center rounded-pill gap-2 bg-light">
                        <Button
                            contentType="icon"
                            dataBsToggle="tooltip"
                            dataBsTrigger="hover focus"
                            tooltipTitle="Share"
                            tooltipPlacement="top"
                            onClick={handleShare}
                            padding="2"
                        >
                            <Icon
                                mainClass="share-icon"
                                name="share"
                                size="15px"/>
                        </Button>
                    </div>

                </div>


            </div>
            {
                Input === false ? (
                    <input type="text" className="form-control rounded-pill small-placeholder"
                           placeholder="Thêm bình luận" onClick={() => {
                        setInput(true)
                    }}/>
                ) : (
                    <WriteComment state={Input} setState={setInput}/>
                )
            }
            {
                props.comments.length > 0 && (
                    <div className="container">
                        {
                            props.comments.map(comment =>
                                (
                                    comment.parentId === null && (
                                        <div key={comment.id} className="mb-4">
                                            <Comment comment={comment} checkparent={true}/>
                                            {
                                                props.comments
                                                    .filter(child => child.parentId === comment.id)
                                                    .map(child => (
                                                        <div key={child.id} className="ms-4 border-start ps-3">
                                                            <Comment comment={child} checkparent={false}/>
                                                        </div>
                                                    ))
                                            }
                                        </div>
                                    )
                                )
                            )
                        }
                    </div>)
            }
        </>

    );

}