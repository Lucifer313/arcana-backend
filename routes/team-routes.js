import express from 'express'

import {
  createTeam,
  getTeams,
  getTeamById,
  deleteTeamById,
  updateTeamById,
  getTeamPlayers,
} from '../controllers/team-controller.js'

import { validateTeamRequest } from '../validators/team-validator.js'

const router = express.Router()

router.route('/create-team').post(validateTeamRequest, createTeam)
router.get('/', getTeams)
router.get('/:tid', getTeamById)
router.delete('/:tid', deleteTeamById)
router.route('/:tid').patch(validateTeamRequest, updateTeamById)
router.get('/:tid/players', getTeamPlayers)

export default router
