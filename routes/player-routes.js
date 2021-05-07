import express from 'express'

import {
  createPlayer,
  getPlayers,
  getPlayerById,
  deletePlayerById,
  updatePlayerById,
} from '../controllers/player-controller.js'

import { validatePlayerRequest } from '../validators/player-validator.js'

const router = express.Router()

router.route('/create-player').post(validatePlayerRequest, createPlayer)
router.get('/', getPlayers)
router.get('/:pid', getPlayerById)
router.delete('/:pid', deletePlayerById)
router.route('/:pid').patch(validatePlayerRequest, updatePlayerById)

export default router
