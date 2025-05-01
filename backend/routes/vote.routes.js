import express from 'express';
import {isAuthenticated} from "#middlewares/auth.mdw.js";
import VoteController from "#controllers/vote.controller.js";

const router = express.Router();

router.delete('/:voteId', isAuthenticated, VoteController.checkVoteOwnership, VoteController.deleteVote);
router.patch('/:voteId', isAuthenticated, VoteController.checkVoteOwnership, VoteController.updateVote);

export default router;