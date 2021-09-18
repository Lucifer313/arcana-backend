import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  active: { type: Boolean, required: true, default: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  date_of_birth: { type: String, required: true },
  alias: { type: String, required: true },
  role: { type: String, required: true, default: 'user' },
  country: { type: String, required: true, default: 'India' },
  profile_image: { type: String, required: true },
  tournaments: [
    {
      days: [
        {
          day: { type: Number },
          playingSquad: [],
          reserveSquad: [],
          addedAt: { type: String },
        },
      ],
      teamPrediction: { type: String },
      arcanaTeam: [],
      points: { type: Number },
    },
  ],
})

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next()
  }

  try {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(this.password, salt)

    this.password = hashedPassword
  } catch (error) {
    next(error)
  }
})

const User = mongoose.model('User', userSchema)
export default User
