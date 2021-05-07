import { check, validationResult } from 'express-validator'

export const validateUserRegistrationRequest = [
  check('name')
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage("User's name can not be empty!")
    .bail()
    .isLength({ min: 3 })
    .withMessage('Name should be minimum of 3 characters!')
    .bail(),
  check('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid Email Address')
    .bail()
    .notEmpty()
    .withMessage('Please enter the email address')
    .bail(),
  check('password')
    .notEmpty()
    .withMessage('Password field should not be empty')
    .bail()
    .isLength({ min: 8 })
    .withMessage('Password must be atleast 8 characters long')
    .bail(),
  check('date_of_birth')
    .isDate()
    .withMessage('Date of Birth should be a valid date')
    .bail(),
  check('alias').notEmpty().withMessage('Alias should not be empty').bail(),
  check('contact')
    .isLength({ min: 10 })
    .withMessage('Contact number should be 10 digits long')
    .bail(),
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() })
    next()
  },
]

export const validateUserLoginRequest = [
  check('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid Email Address 313')
    .bail()
    .notEmpty()
    .withMessage('Please enter the email address')
    .bail(),
  check('password')
    .notEmpty()
    .withMessage('Password field should not be empty')
    .bail()
    .isLength({ min: 8 })
    .withMessage('Password must be atleast 8 characters long')
    .bail(),
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() })
    next()
  },
]

export const validateUserUpdateRequest = [
  check('name')
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage("User's name can not be empty!")
    .bail()
    .isLength({ min: 3 })
    .withMessage('Name should be minimum of 3 characters!')
    .bail(),
  check('contact')
    .isLength({ min: 10 })
    .withMessage('Contact number should be 10 digits long')
    .bail(),
  check('alias').notEmpty().withMessage('Alias should not be empty').bail(),
  check('date_of_birth')
    .isDate()
    .withMessage('Date of Birth should be a valid date')
    .bail(),
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() })
    next()
  },
]
