import express from 'express'

import {
  registerUser,
  loginUser,
  getUserById,
  updateUserById,
} from '../controllers/user-controller.js'

import protect from '../middlewares/protect-middleware.js'
import mediaUpload from '../middlewares/media-upload.js'

import {
  validateUserRegistrationRequest,
  validateUserLoginRequest,
  validateUserUpdateRequest,
} from '../validators/user-validator.js'

const router = express.Router()

router.post('/register', mediaUpload.single('profile_image'), registerUser)

router.route('/login').post(validateUserLoginRequest, loginUser)

router
  .route('/profile')
  .get(protect, getUserById)
  .patch(validateUserUpdateRequest, protect, updateUserById)

export default router
