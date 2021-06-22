import Tournament from '../models/torunament-model.js'
import asyncHandler from 'express-async-handler'
import Player from '../models/player-model.js'

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
    //Logic to add the tournament ID to each player's tournament array
    for (const team of teams) {
      //Extracting the players that have the team as the tournament's qualified team
      let players = await Player.find({ team })
      //For each player adding the id and other data to their tournament array
      for (const player of players) {
        //Creating new tournament object
        let newTournament = {
          id: tournament._id,
          points: [],
          total_points: 0,
        }
        //Appending the new object into the tournament's array
        player.tournaments = [...player.tournaments, newTournament]
        //Saving the updated object model
        await player.save()
      }
    }

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

export const deleteTournamentById = asyncHandler(async (req, res) => {
  try {
    const tournamentId = req.params.tid

    let tournament = await Tournament.findById(tournamentId)

    if (!tournament) {
      res.status(404)
      throw new Error('Invalid Tournament ID')
    }

    await tournament.remove()

    res.status(200)
    res.json({
      _id: tournament._id,
    })
  } catch (error) {
    throw new Error(error)
  }
})
//This route will give the players qualified for a selected tournament based on the provided role
export const getQualifiedPlayersByRole = asyncHandler(async (req, res) => {
  try {
    const { role } = req.body
    const tournamentId = req.params.tid

    let tournament = await Tournament.findById(tournamentId)

    if (!tournament) {
      res.status(404)
      throw new Error('Invalid tournament Id')
    }

    let players = await Player.find({ team: { $in: tournament.teams }, role })

    res.status(200)
    res.json(players)
  } catch (error) {
    throw new Error(error)
  }
})
