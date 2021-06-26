import express from 'express'
import {
  createTournament,
  deleteTournamentById,
  getQualifiedPlayers,
  getQualifiedTeams,
  getTournaments,
} from '../controllers/tournament-controller.js'

const router = express.Router()

router.post('/create', createTournament)
router.get('/', getTournaments)
router.delete('/:tid', deleteTournamentById)
router.get('/:tid/qualified-players', getQualifiedPlayers)
router.get('/:tid/qualified-teams', getQualifiedTeams)

export default router
