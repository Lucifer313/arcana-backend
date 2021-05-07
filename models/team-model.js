import mongoose from 'mongoose'

const teamSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    region: { type: String, required: true },
    description: { type: String, required: true, maxLength: 500 },
    logo: { type: String, required: true },
    banner_image: {
      type: String,
      required: true,
      default: 'https://arcana-banner.png',
    },
    tis_won: { type: Number, required: true, min: 0 },
    creation_date: { type: String, required: true },
  },
  {
    timestamps: true,
  }
)

const Team = mongoose.model('Team', teamSchema)
export default Team
