import express from 'express'

import {
  registerUser,
  loginUser,
  getUserById,
  updateUserById,
  createArcanaTeam,
  getMyTournaments,
  addMyPlayingSquad,
  allowAddingSquad,
  getSquadByDay,
  forgotPassword,
  resetPassword,
} from '../controllers/user-controller.js'

import protect from '../middlewares/protect-middleware.js'
import mediaUpload from '../middlewares/media-upload.js'

const router = express.Router()

router.post('/register', mediaUpload.single('profile_image'), registerUser)

router.route('/login').post(loginUser)

router.route('/profile').get(protect, getUserById)

router.patch(
  '/profile',
  mediaUpload.single('profile_image'),
  protect,
  updateUserById
)

router.post('/tournaments/:tid/createArcanaTeam', createArcanaTeam)
router.get('/:uid/my-tournaments/', getMyTournaments)

router.post('/:uid/add-playing-squad', addMyPlayingSquad)
router.post('/:uid/allow-adding-squad', allowAddingSquad)
router.post('/:uid/get-squad-by-day', getSquadByDay)
router.post('/forgot-password', forgotPassword)
router.route('/reset-password').post(protect, resetPassword)

export default router
