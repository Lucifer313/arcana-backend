import mongoose from 'mongoose'

const playerSchema = mongoose.Schema(
  {
    alias: { type: String, required: true },
    role: { type: String, required: true },
    profile_image: { type: String, required: true },
    date_of_birth: { type: String, required: true },
    region: { type: String, required: true },
    country: { type: String, required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    tis_won: { type: String, required: true },
  },
  {
    timestamps: true,
  }
)

const Player = mongoose.model('Player', playerSchema)
export default Player
