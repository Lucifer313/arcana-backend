import express from 'express'
import {
  createTournament,
  getTournaments,
} from '../controllers/tournament-controller.js'

const router = express.Router()

router.post('/create', createTournament)
router.get('/', getTournaments)

export default router
