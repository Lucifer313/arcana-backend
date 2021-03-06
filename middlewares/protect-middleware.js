import jwt from 'jsonwebtoken'
import User from '../models/user-model.js'
import asyncHandler from 'express-async-handler'

const protect = asyncHandler(async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1]
      const decodedToken = jwt.verify(token, process.env.JWTSECRET)

      req.user = await User.findById(decodedToken.id).select('-password')
      next()
    } catch (error) {
      res.status(401)

      if (error.message === 'jwt expired') {
        throw new Error(
          'Reset password link expired. Please go to forgot password page to generate a new reset password link'
        )
      } else {
        throw new Error('Unauthorized. Invalid token')
      }
    }
  } else {
    res.status(401)

    throw new Error('Unauthorized. Token not found')
  }
})

export default protect
