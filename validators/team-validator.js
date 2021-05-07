import { check, validationResult } from 'express-validator'

export const validateTeamRequest = [
  check('name')
    .notEmpty()
    .withMessage('Team name cannot be empty')
    .bail()
    .isLength({ min: 5 })
    .withMessage('Team name should be atleast 5 characters')
    .bail(),
  check('region')
    .notEmpty()
    .withMessage('Team region cannot be empty')
    .bail()
    .isLength({ min: 3 })
    .withMessage('Team region should be atleast 3 characters')
    .bail(),
  check('description')
    .notEmpty()
    .withMessage('Team description cannot be empty')
    .bail()
    .isLength({ max: 500 })
    .withMessage('Team description cannot be more than 500 characters')
    .bail(),
  check('logo').notEmpty().withMessage('Team Logo cannot be empty').bail(),
  check('tis_won')
    .isInt({ min: 0 })
    .withMessage('Tis won should not be less than 0')
    .bail()
    .isNumeric()
    .withMessage('TIs won should be a numeric value')
    .bail(),
  check('creation_date')
    .isDate()
    .withMessage('Creation date should be a valid date')
    .bail(),
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() })
    next()
  },
]
