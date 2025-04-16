import React from "react";
import Avatar from "#shared/components/UIElement/Avatar/Avatar";
import Button from "#shared/components/UIElement/Button/Button";
import Icon from "#shared/components/UIElement/Icon/Icon";
import './Comment.css'
//import {useVote} from "./vote-hook-comment.js"
import {useVote} from "./vote-hook-comment.js"

export default function Comment(props) {
    const {
        voteStatus,
        voteCount,
        handleUpvote,
        handleDownvote
    } = useVote(props.comment.upvotes);
    //const [write, setWrite] = useState(false)
    return (
        <div className="card p-3 my-3">
            <div className="d-flex align-items-center mb-2">
                <Avatar
                    src={props.comment.src}
                    alt={`r/${props.comment.alt}`}
                    width={40}
                    height={40}/>
                <div className="d-flex flex-row flex-wrap fs-8 ms-2 align-items-center">
                    <div className="fw-bold fs-custom underline">
                        {props.comment.username}
                    </div>
                    &nbsp;&nbsp;&nbsp;•
                    <span className="text-muted ms-1 underline">{props.comment.time}</span>
                </div>
            </div>
            {/* Post Content */}
            <div className=" text-muted d-flex align-items-center fs-content mt-2">
                {props.comment.content}
            </div>
            {/* Post Actions */}
            <div className="d-flex align-items-center gap-2 mt-2">
                <div className={"d-flex align-items-center gap-2 "}>
                    <Button
                        mainClass={`${voteStatus === "upvoted" ? "upvoted" : ""}`}
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
                        mainClass={`${voteStatus === "downvoted" ? "downvoted" : ""}`}
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
                {
                    props.checkparent === true &&
                    (
                        <div className="comment-container d-flex align-items-center rounded-pill gap-2 bg-light">
                    <Button
                        contentType="icon"
                        dataBsToggle="tooltip"
                        dataBsTrigger="hover focus"
                        tooltipTitle="Comment"
                        tooltipPlacement="top"
                        padding="2"
                        onClick={props.setWrite}
                    >
                        <Icon
                            mainClass="comment-icon"
                            name="comment"
                            size="15px"/>
                        <div className="ms-2 fs-icon">Trả lời</div>
                    </Button>

                        </div>
                    )

                }
                
                <div className="share-container d-flex align-items-center rounded-pill gap-2 bg-light">
                    <Button
                        contentType="icon"
                        dataBsToggle="tooltip"
                        dataBsTrigger="hover focus"
                        tooltipTitle="Share"
                        tooltipPlacement="top"
                        padding="2"
                    >
                        <Icon
                            mainClass="share-icon"
                            name="share"
                            size="15px"/>
                        <div className="ms-2 fs-icon"> Chia sẻ</div>
                    </Button>
                </div>
                <div className="option-container d-flex align-items-center rounded-pill gap-2 bg-light">
                    <div className="dropdown">
                    <Button
                        contentType="icon"
                        dataBsToggle="dropdown"
                        dataBsTrigger="hover focus"
                        tooltipTitle="option"
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
                                    name="save"
                                    size="15px"/>
                                Lưu
                            </Button>
                            </li>
                            <li><Button addClass="w-100">
                                <Icon
                                    addClass="me-3"
                                    //mainClass="save-icon"
                                    name="report"
                                    size="15px"
                                />
                                Báo cáo
                            </Button></li>
                        </ul>

                    </div>

                    
                </div>

            </div>
            {/* <div className="mt-3">
                {write && <WriteComment state={write} setState={setWrite}/>}
            </div> */}


        </div>

    );

}