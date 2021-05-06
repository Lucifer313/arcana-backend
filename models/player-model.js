import mongoose from 'mongoose'

const playerSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    alias: { type: String, required: true },
    steam_id: { type: String, required: true, default: '10000' },
    profile_image: { type: String, required: true },
    date_of_birth: { type: String, required: true },
    region: { type: String, required: true },
    country: { type: String, required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    tis_won: { type: String, required: true },
    prize_money: { type: String, required: true },
  },
  {
    timestamps: true,
  }
)

const Player = mongoose.model('Player', playerSchema)
export default Player
