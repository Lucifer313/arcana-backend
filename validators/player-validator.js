import { check, validationResult } from 'express-validator'

export const validatePlayerRequest = [
  check('name')
    .notEmpty()
    .withMessage('Player name cannot be empty')
    .bail()
    .isLength({ min: 5 })
    .withMessage('Player name should be atleast 2 characters')
    .bail(),
  check('alias')
    .notEmpty()
    .withMessage('Player alias cannot be empty')
    .bail()
    .isLength({ min: 2 })
    .withMessage('Player alias should be atleast 2 characters')
    .bail(),
  check('profile_image')
    .notEmpty()
    .withMessage('Player profile image cannot be empty')
    .bail(),
  check('date_of_birth')
    .isDate()
    .withMessage("Player's  date of birth should be a valid date")
    .bail(),
  check('region')
    .notEmpty()
    .withMessage('Player region cannot be empty')
    .bail()
    .isLength({ min: 3 })
    .withMessage('Player region should be atleast 3 characters')
    .bail(),
  check('country')
    .notEmpty()
    .withMessage('Player country cannot be empty')
    .bail()
    .isLength({ min: 3 })
    .withMessage('Player country should be atleast 3 characters')
    .bail(),
  check('team').notEmpty().withMessage("Player's Team cannot be empty").bail(),
  check('tis_won')
    .isInt({ min: 0 })
    .withMessage('Tis won should not be less than 0')
    .bail()
    .isNumeric()
    .withMessage('TIs won should be a numeric value')
    .bail(),
  check('prize_money')
    .isInt({ min: 0 })
    .withMessage('Prize money won should not be less than 0')
    .bail()
    .isNumeric()
    .withMessage('Prize money won should be a numeric value')
    .bail(),
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() })
    next()
  },
]
