import express from 'express'
import {
  createTournament,
  deleteTournamentById,
  getQualifiedPlayersByRole,
  getTournaments,
} from '../controllers/tournament-controller.js'

const router = express.Router()

router.post('/create', createTournament)
router.get('/', getTournaments)
router.delete('/:tid', deleteTournamentById)
router.post('/:tid/qualified-players', getQualifiedPlayersByRole)

export default router
