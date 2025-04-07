import React from "react";

import Avatar from "@shared/components/UIElement/Avatar/Avatar";
import Identifier from "@shared/components/UIElement/Identifier/Identifier";
import Button from "@shared/components/UIElement/Button/Button";
import Icon from "@shared/components/UIElement/Icon/Icon";

import "./PostPreview.css";
import {useVote} from "./vote-hook.jsx"

export default function PostPreview(props) {

	const {
		voteStatus,
		voteCount,
		handleUpvote,
		handleDownvote
	} = useVote({initialCount: props.post.upvotes, initialVoteStatus: null}, props.post.id);

	return (
		<div className="post-preview-container card p-3 my-3">
			{/* Subreddit Info */}
			<div className="d-flex align-items-center mb-2">
				<Avatar
					src={props.post.subtable.avatar.src}
					alt={`r/${props.post.subtable.namespace}`}
					width={20}
					height={20}/>
				<div className="d-flex flex-row flex-wrap fs-8">
					<Identifier
						addClass="ms-2"
						type="subtable"
						namespace={props.post.subtable.namespace}/>
					&nbsp;•&nbsp;
					<span className="text-muted">{props.post.time}</span>
				</div>
			</div>

			{/* Post Title */}
			<h5 className="fw-bold">{props.post.title}</h5>

			{/* Post Content */}
			<p>{props.post.content}</p>

			{/* Post Actions */}
			<div className="d-flex align-items-center gap-2">
				<div
					className={`vote-container ${voteStatus} d-flex align-items-center rounded-pill gap-2 bg-light`}>
					<Button
						mainClass="upvote-btn"
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
						mainClass="downvote-btn"
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
						mainClass="comment-btn"
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
						mainClass="share-btn"
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
					</Button>
				</div>
				<div className="option-container d-flex align-items-center rounded-pill gap-2 bg-light">
					<Button
						mainClass="option-btn"
						contentType="icon"
						dataBsToggle="tooltip"
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
				</div>
			</div>
		</div>
	);
}
