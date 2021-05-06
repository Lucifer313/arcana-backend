import express from 'express'

import {
  createPlayer,
  getPlayers,
  getPlayerById,
  deletePlayerById,
} from '../controllers/player-controller.js'

const router = express.Router()

router.post('/create-player', createPlayer)
router.get('/', getPlayers)
router.get('/:pid', getPlayerById)
router.delete('/:pid', deletePlayerById)
export default router
