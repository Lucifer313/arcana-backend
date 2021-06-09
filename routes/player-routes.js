import express from 'express'
import mediaUpload from '../middlewares/media-upload.js'

import {
  createPlayer,
  getPlayers,
  getPlayerById,
  deletePlayerById,
  updatePlayerById,
} from '../controllers/player-controller.js'

import { validatePlayerRequest } from '../validators/player-validator.js'

const router = express.Router()

router.post('/create-player', mediaUpload.single('profile_image'), createPlayer)
router.get('/', getPlayers)
router.get('/:pid', getPlayerById)
router.delete('/:pid', deletePlayerById)
router.route('/:pid').patch(validatePlayerRequest, updatePlayerById)

export default router
