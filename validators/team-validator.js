import { body, validationResult } from 'express-validator'

export const validateTeamRequest = [
  body('name')
    .notEmpty()
    .withMessage('Team name cannot be empty')
    .bail()
    .isLength({ min: 2 })
    .withMessage('Team name should be atleast 5 characters')
    .bail(),
  body('description')
    .notEmpty()
    .withMessage('Team description cannot be empty')
    .bail()
    .isLength({ max: 500 })
    .withMessage('Team description cannot be more than 500 characters')
    .bail(),
  //body('logo').notEmpty().withMessage('Team Logo cannot be empty').bail(),
  body('tis_won')
    .isInt({ min: 0 })
    .withMessage('Tis won should not be less than 0')
    .bail()
    .isNumeric()
    .withMessage('TIs won should be a numeric value')
    .bail(),
  //body('creation_date')
  //  .isDate()
  //  .withMessage('Creation date should be a valid date')
  //  .bail(),
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) console.log(req.body)
    return res.status(422).json({ errors: errors.array() })
    next()
  },
]
