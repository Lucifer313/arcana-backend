import express from 'express'
import {
  addPoints,
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
router.post('/add-points', addPoints)

export default router
