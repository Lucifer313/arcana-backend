import express from 'express'

import {
  createTeam,
  getTeams,
  getTeamById,
  deleteTeamById,
  updateTeamById,
  getTeamPlayers,
} from '../controllers/team-controller.js'

const router = express.Router()

router.post('/create-team', createTeam)
router.get('/', getTeams)
router.get('/:tid', getTeamById)
router.delete('/:tid', deleteTeamById)
router.patch('/:tid', updateTeamById)
router.get('/:tid/players', getTeamPlayers)

export default router
