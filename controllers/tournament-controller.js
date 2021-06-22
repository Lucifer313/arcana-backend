import Tournament from '../models/torunament-model.js'
import asyncHandler from 'express-async-handler'

export const createTournament = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      tier,
      number_of_teams,
      prize_pool,
      begin_date,
      end_date,
      number_of_days,
      teams,
    } = req.body

    const tournament = await Tournament.create({
      name,
      tier,
      number_of_teams,
      prize_pool,
      begin_date,
      end_date,
      number_of_days,
      teams,
    })

    res.json({
      _id: tournament._id,
      name: tournament.name,
      tier: tournament.tier,
      number_of_teams: tournament.number_of_teams,
      prize_pool: tournament.prize_pool,
      begin_date: tournament.begin_date,
      end_date: tournament.end_date,
      number_of_days: tournament.number_of_days,
      teams: tournament.teams,
    })
  } catch (error) {
    throw new Error(error)
  }
})

export const getTournaments = asyncHandler(async (req, res) => {
  try {
    const tournaments = await Tournament.find({})
    res.json(tournaments)
  } catch (error) {
    throw new Error(error)
  }
})
