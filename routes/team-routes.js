import express from 'express'

import {
  createTeam,
  getTeams,
  getTeamById,
  deleteTeamById,
  updateTeamById,
  getTeamPlayers,
} from '../controllers/team-controller.js'

import mediaUpload from '../middlewares/media-upload.js'

import { validateTeamRequest } from '../validators/team-validator.js'

const router = express.Router()

router.post('/create', mediaUpload.single('logo'), createTeam)
router.get('/', getTeams)
router.get('/:tid', getTeamById)
router.delete('/:tid', deleteTeamById)
router.route('/:tid').patch(updateTeamById)
router.get('/:tid/players', getTeamPlayers)

export default router
