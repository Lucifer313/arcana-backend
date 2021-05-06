import mongoose from 'mongoose'

const teamSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    region: { type: String, required: true },
    description: { type: String, required: true },
    logo: { type: String, required: true },
    banner_image: { type: String, required: true },
    tis_won: { type: String, required: true },
    creation_date: { type: String, required: true },
  },
  {
    timestamps: true,
  }
)

const Team = mongoose.model('Team', teamSchema)
export default Team
