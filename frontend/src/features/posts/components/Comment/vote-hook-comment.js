import {useState} from "react";

export function useVote(initialCount = 0) {
    const [voteStatus, setVoteStatus] = useState(null); // null | 'upvoted' | 'downvoted'
    const [voteCount, setVoteCount] = useState(initialCount);

    const resetVote = () => {
        if (voteStatus === "upvoted") {
            setVoteCount((prev) => prev - 1);
        } else if (voteStatus === "downvoted") {
            setVoteCount((prev) => prev + 1);
        }
        setVoteStatus(null);
    };

    const handleUpvote = () => {
        if (voteStatus === "upvoted") {
            resetVote();
        } else {
            resetVote();
            setVoteStatus("upvoted");
            setVoteCount((prev) => prev + 1);
        }
    };

    const handleDownvote = () => {
        if (voteStatus === "downvoted") {
            resetVote();
        } else {
            resetVote();
            setVoteStatus("downvoted");
            setVoteCount((prev) => prev - 1);
        }
    };

    return {
        voteStatus,
        voteCount,
        handleUpvote,
        handleDownvote
    };
}
