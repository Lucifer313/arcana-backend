import mongoose from 'mongoose'

const tournamentSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    tier: { type: String, required: true },
    number_of_teams: { type: String, required: true },
    prize_pool: { type: String, required: true },
    begin_date: { type: String, required: true },
    end_date: { type: String, required: true },
    number_of_days: { type: String, required: true },
    teams: [{ type: String, required: true }],
  },
  {
    timestamps: true,
  }
)

const Tournament = mongoose.model('Tournament', tournamentSchema)
export default Tournament
