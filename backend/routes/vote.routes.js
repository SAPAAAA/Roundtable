import express from 'express';
import {isAuthenticated} from "#middlewares/auth.mdw.js";
import voteController from "#controllers/vote.controller.js";

const router = express.Router();

router.delete('/:voteId', isAuthenticated, voteController.checkVoteOwnership, voteController.deleteVote);
router.patch('/:voteId', isAuthenticated, voteController.checkVoteOwnership, voteController.updateVote);

export default router;