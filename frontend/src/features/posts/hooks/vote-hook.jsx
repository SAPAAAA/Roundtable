// Action Types (optional but good practice for clarity and avoiding typos)
import {useCallback, useReducer} from "react";

// --- Reducer Setup ---
const ACTIONS = {
    VOTE_START: 'VOTE_START',     // Action starts
    VOTE_SUCCESS: 'VOTE_SUCCESS', // Action succeeded (fetch + calculation)
    VOTE_ERROR: 'VOTE_ERROR',     // Action failed (fetch error)
};

// The reducer function
function voteReducer(state, action) {
    console.log("Reducer action:", action.type, "Payload:", action.payload); // Debugging
    switch (action.type) {
        case ACTIONS.VOTE_START:
            return {
                ...state,
                isVoting: true,             // Set loading state for the vote action
                voteError: null             // Clear previous errors
            };
        case ACTIONS.VOTE_SUCCESS:
            return {
                ...state,
                isVoting: false,
                voteCount: action.payload.finalVoteCount,
                voteStatus: action.payload.finalVoteStatus,
                voteError: null,
            };
        case ACTIONS.VOTE_ERROR:
            return {
                ...state,
                isVoting: false,            // Stop loading
                voteError: action.payload   // Store the error
            };
        default:
            return state;
    }
}

// --- Initializer Function ---
function initVoteState(initialArgs) { // Renamed argument for clarity
    // Access properties from the passed-in object
    const count = typeof initialArgs.initialCount === 'number' && !isNaN(initialArgs.initialCount)
        ? initialArgs.initialCount
        : 0;

    const status = initialArgs.initialVoteStatus === 'upvoted' || initialArgs.initialVoteStatus === 'downvoted'
        ? initialArgs.initialVoteStatus
        : null;

    const userId = initialArgs.userId || null; // Added userId check

    return {
        isVoting: false,
        voteCount: count,
        voteStatus: status,
        voteError: null,
        userId: userId, // Added userId to state
    };
}

// --- Custom Hook ---
export default function useVote(initialState, postId) {
    // Use useReducer: pass reducer, initial argument, and initializer function
    const [state, dispatch] = useReducer(voteReducer, initialState, initVoteState);

    // Handlers now dispatch actions to the reducer
    const handleVote = useCallback(async (voteType) => {
        if (state.isVoting) return; // Prevent multiple clicks
        if (!postId) {
            dispatch(
                {type: ACTIONS.VOTE_ERROR, payload: "No postId provided for voting."}
            )
        }
        dispatch({type: ACTIONS.VOTE_START});
        try {

            let finalVoteCount = state.voteCount;
            let finalVoteStatus = state.voteStatus;

            if (voteType === 'upvote') {
                console.log("Vote status before upvote:", finalVoteStatus); // Debugging
                if (finalVoteStatus === 'upvoted') {
                    finalVoteCount -= 1;
                    finalVoteStatus = null;
                } else if (finalVoteStatus === 'downvoted') {
                    finalVoteCount += 2;
                    finalVoteStatus = 'upvoted';
                } else {
                    finalVoteCount += 1;
                    finalVoteStatus = 'upvoted';
                }
            } else if (voteType === 'downvote') {
                if (finalVoteStatus === 'downvoted') {
                    finalVoteCount += 1;
                    finalVoteStatus = null;
                } else if (finalVoteStatus === 'upvoted') {
                    finalVoteCount -= 2;
                    finalVoteStatus = 'downvoted';
                } else {
                    finalVoteCount -= 1;
                    finalVoteStatus = 'downvoted';
                }
            }
            console.log("Vote status after vote:", finalVoteStatus); // Debugging
            dispatch({
                type: ACTIONS.VOTE_SUCCESS,
                payload: {finalVoteCount, finalVoteStatus}
            });
        } catch (error) {
            dispatch({
                    type: ACTIONS.VOTE_ERROR,
                    payload: error.message
                }
            );
        }
    }, [
        state.isVoting,
        state.voteCount,
        state.voteStatus,
        postId,
    ]);

    const handleUpvote = useCallback(() => handleVote('upvote'), [handleVote]);
    const handleDownvote = useCallback(() => handleVote('downvote'), [handleVote]);

    return {
        ...state,
        handleUpvote,
        handleDownvote,
    }
}