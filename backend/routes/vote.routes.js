// backend/routes/vote.routes.js
import express from 'express';
import {isAuthenticated} from "#middlewares/auth.mdw.js";
// Import controller instance AND the middleware
import VoteController, {checkVoteOwnershipMiddleware} from "#controllers/vote.controller.js";

const router = express.Router();

router.patch(
    '/:voteId',
    isAuthenticated,
    checkVoteOwnershipMiddleware, // Check ownership before allowing update
    VoteController.updateVote
);

router.delete(
    '/:voteId',
    isAuthenticated,
    checkVoteOwnershipMiddleware, // Check ownership before allowing delete
    VoteController.deleteVote
);

export default router;