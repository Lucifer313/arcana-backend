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

const router = express.Router()

router.post('/create', mediaUpload.single('logo'), createTeam)
router.get('/', getTeams)
router.get('/:tid', getTeamById)
router.delete('/:tid', deleteTeamById)
router.patch('/:tid', mediaUpload.single('logo'), updateTeamById)
router.get('/:tid/players', getTeamPlayers)

export default router
