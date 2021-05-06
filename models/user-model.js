import mongoose from 'mongoose'

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  date_of_birth: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  alias: { type: String, required: true },
  role: { type: String, required: true, default: 'user' },
  contact: { type: String, required: true },
  country: { type: String, required: true, default: 'India' },
  profile_image: { type: String, required: true, default: 'http://arcana.png' },
})

const User = mongoose.model('User', userSchema)
export default User
