import express from 'express'

import {
  registerUser,
  loginUser,
  getUserById,
  updateUserById,
} from '../controllers/user-controller.js'

import { check } from 'express-validator'

const router = express.Router()

router.post(
  '/register',
  [check('email').normalizeEmail().isEmail(), check('email').notEmpty()],
  registerUser
)

router.post(
  '/login',
  [check('email').normalizeEmail().isEmail(), check('email').notEmpty()],
  loginUser
)

router.get('/:uid', getUserById)
router.patch('/:uid', updateUserById)

export default router
