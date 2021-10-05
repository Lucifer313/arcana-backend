import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'

const mediaUpload = multer({
  limits: 500000,
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/images')
    },

    filename: (req, file, cb) => {
      cb(
        null,
        file.fieldname + '-' + uuidv4() + path.extname(file.originalname)
      )
    },
  }),

  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/gif'
    ) {
      cb(null, true)
      console.log('Accepted')
    } else {
      cb(null, false)
      console.log('Rejected')
    }
  },
})

export default mediaUpload
