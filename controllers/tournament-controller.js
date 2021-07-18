import Tournament from '../models/torunament-model.js'
import asyncHandler from 'express-async-handler'
import Player from '../models/player-model.js'
import Team from '../models/team-model.js'
import mongoose from 'mongoose'
import axios from 'axios'

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
    const tournaments = await Tournament.find({}).populate('team')
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
export const getQualifiedPlayers = asyncHandler(async (req, res) => {
  try {
    const tournamentId = req.params.tid
    console.log(tournamentId)
    let tournament = await Tournament.findById(tournamentId)

    if (!tournament) {
      res.status(404)
      throw new Error('Invalid tournament Id')
    }

    let players = await Player.find({
      team: { $in: tournament.teams },
    }).populate('team')

    res.status(200)
    res.json(players)
  } catch (error) {
    console.log(error)
    throw new Error(error)
  }
})

export const getQualifiedTeams = asyncHandler(async (req, res) => {
  try {
    const tournamentId = req.params.tid

    let tournament = await Tournament.findById(tournamentId)

    if (!tournament) {
      res.status(404)
      throw new Error('Invalid Tournament Id')
    }

    let teams = await Team.find({
      _id: { $in: tournament.teams },
    })

    res.status(200)
    res.json(teams)
  } catch (error) {
    throw new Error(error)
  }
})

//Main function to add Points
export const addPoints = asyncHandler(async (req, res) => {
  const { tournamentId, matchId, dayNum, matchNum, team1, team2 } = req.body

  let db = mongoose.connection
  //Getting the data from Dota OPENAPI
  let matchDetails = await axios.get(
    `https://api.opendota.com/api/matches/${matchId}`
  )

  //Extracting the player array
  let {
    data: { players },
  } = matchDetails
  //Looping through each player to calculate points and add it to their mongodb records
  players.forEach((player) => {
    //Extracting each parameter to be calculated and multiplying it with the multipliers
    const kills = player.kills * 3
    const deaths = player.deaths * -3
    const assists = player.assists * 1.5
    const gpm = player.gold_per_min * 0.02
    const xpm = player.xp_per_min * 0.02
    const last_hits = player.last_hits * 0.03
    const first_blood = player.firstblood_claimed * 20
    const heal = player.hero_healing * 0.002
    const camps_stacked = player.camps_stacked * 6
    const win = player.win * 40
    //Purchase is a combination of wards, sod and dop
    const {
      purchase: { ward_sentry, smoke_of_deceit, dust_of_appearance },
    } = player

    //Calculating the support gold
    const ward_sentry_gold = ward_sentry === undefined ? 0 : ward_sentry * 50
    const smoke_of_deceit_gold =
      smoke_of_deceit === undefined ? 0 : smoke_of_deceit * 50
    const dust_of_appearance_gold =
      dust_of_appearance === undefined ? 0 : dust_of_appearance * 80
    //Multiplying the support gold with its multiplier
    const support_gold =
      (ward_sentry_gold + smoke_of_deceit_gold + dust_of_appearance_gold) *
      0.005
    //console.log(support_gold)
    //Calculating the final points for the player
    let points =
      kills +
      deaths +
      assists +
      gpm +
      xpm +
      last_hits +
      first_blood +
      heal +
      camps_stacked +
      win +
      support_gold

    //Rounding the points
    points = Math.round(points * 100) / 100

    // console.log(player.name + ' : ' + points)

    //Adding the points to the player document
    db.collection('players').updateOne(
      {
        alias: player.name,
        'tournaments.id': mongoose.Types.ObjectId(tournamentId),
      },
      {
        $push: {
          'tournaments.$.points': {
            dayNum,
            matchNum,
            team1,
            team2,
            points,
          },
        },
        $inc: {
          'tournaments.$.total_points': points,
        },
      }
    )
  })

  res.json('Done')
})
