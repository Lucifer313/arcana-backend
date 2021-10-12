import express from 'express'
import {
  addPoints,
  checkPlayerName,
  createTournament,
  deleteTournamentById,
  eliminateTeam,
  getArcanaLeaderboard,
  getPlayerLeaderboard,
  getQualifiedPlayers,
  getQualifiedTeams,
  getTournaments,
  undoEliminateTeam,
} from '../controllers/tournament-controller.js'

const router = express.Router()

router.post('/create', createTournament)
router.get('/', getTournaments)
router.delete('/:tid', deleteTournamentById)
router.get('/:tid/qualified-players', getQualifiedPlayers)
router.get('/:tid/qualified-teams', getQualifiedTeams)
router.post('/add-points', addPoints)
router.get('/:tid/player-leaderboard', getPlayerLeaderboard)
router.patch('/:tid/eliminate-team', eliminateTeam)
router.patch('/:tid/undo-eliminate-team', undoEliminateTeam)
router.get('/:tid/arcana-leaderboard', getArcanaLeaderboard)
router.get('/check-players', checkPlayerName)

export default router
