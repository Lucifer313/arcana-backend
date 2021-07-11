import express from 'express'
import mediaUpload from '../middlewares/media-upload.js'

import {
  createPlayer,
  getPlayers,
  getPlayerById,
  deletePlayerById,
  updatePlayerById,
  addPoints,
  getPlayerLeaderboard,
} from '../controllers/player-controller.js'

const router = express.Router()

router.post('/create-player', mediaUpload.single('profile_image'), createPlayer)
router.get('/', getPlayers)
router.get('/:pid', getPlayerById)
router.delete('/:pid', deletePlayerById)
router.patch('/:pid', mediaUpload.single('profile_image'), updatePlayerById)
router.post('/add-points', addPoints)

router.get('/:tid/player-leaderboard', getPlayerLeaderboard)

export default router
