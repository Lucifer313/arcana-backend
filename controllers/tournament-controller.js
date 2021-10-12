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
          eliminated: false,
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

    let eliminatedTeams = tournament.eliminated_teams

    res.status(200)
    res.json({ teams, eliminatedTeams })
  } catch (error) {
    throw new Error(error)
  }
})

//Main function to add Points
export const addPoints = asyncHandler(async (req, res) => {
  try {
    const { tournamentId, matchId, dayNum, matchNum, team1, team2 } = req.body
    console.log(req.body)
    let currentPlayer
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
    for (const player of players) {
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
        purchase: { ward_sentry, smoke_of_deceit, dust_of_appearance, gem },
      } = player

      console.log(
        'Kills: ' +
          player.kills +
          ' deaths: ' +
          player.deaths +
          ' gpm: ' +
          player.gold_per_min +
          ' xpm: ' +
          player.xp_per_min +
          ' last hits: ' +
          player.last_hits +
          ' first blood: ' +
          player.firstblood_claimed +
          ' camps: ' +
          player.camps_stacked +
          ' win: ' +
          player.win +
          ' sentry: ' +
          ward_sentry +
          ' smoke: ' +
          smoke_of_deceit +
          ' dust_of_appearance: ' +
          dust_of_appearance +
          ' Gem: ' +
          gem
      )

      //Calculating the support gold
      const ward_sentry_gold = ward_sentry === undefined ? 0 : ward_sentry * 50
      const gem_gold = gem === undefined ? 0 : gem * 900
      const smoke_of_deceit_gold =
        smoke_of_deceit === undefined ? 0 : smoke_of_deceit * 50
      const dust_of_appearance_gold =
        dust_of_appearance === undefined ? 0 : dust_of_appearance * 80
      //Multiplying the support gold with its multiplier
      const support_gold =
        (ward_sentry_gold +
          smoke_of_deceit_gold +
          dust_of_appearance_gold +
          gem_gold) *
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
      //Getting the player Id
      currentPlayer = await Player.find({ alias: player.name })
      console.log('Player Name: ' + player.name)
      console.log('Player Points: ' + points)

      let currentPlayerId = mongoose.Types.ObjectId(currentPlayer[0]._id)
      console.log('Current Player ID: ' + currentPlayerId)

      //console.log('Current Player ID: ' + currentPlayerId)
      //console.log('Day Number: ' + dayNum)
      //console.log(currentPlayer[0]._id)
      //Logic to update user document if they have the current player in the squad
      db.collection('users').updateMany(
        {
          'tournaments._id': mongoose.Types.ObjectId(tournamentId),
          'tournaments.days.day': parseInt(dayNum),
          'tournaments.days.playingSquad': { $in: [currentPlayerId] },
        },
        {
          $inc: {
            'tournaments.$.points': points,
          },
        }
      )
    }

    res.json('done')
  } catch (error) {
    console.log(error)
    throw new Error(error)
  }
})
//Getting the Player Leaderboard
export const getPlayerLeaderboard = asyncHandler(async (req, res) => {
  try {
    const tournamentId = mongoose.Types.ObjectId(req.params.tid)

    let db = mongoose.connection

    db.collection('players')
      .aggregate([
        {
          $unwind: '$tournaments',
        },
        {
          $match: {
            'tournaments.id': mongoose.Types.ObjectId(tournamentId),
          },
        },
        {
          $project: {
            'tournaments.total_points': 1,
            alias: 1,
            _id: 1,
            profile_image: 1,
          },
        },
        {
          $sort: {
            'tournaments.total_points': -1,
          },
        },
      ])
      .toArray()
      .then((docs) => {
        res.json(docs)
      })
    //res.json(playerList)
  } catch (error) {
    throw new Error(error)
  }
})

export const getQualifiedPlayers = asyncHandler(async (req, res) => {
  try {
    let tournamentId = mongoose.Types.ObjectId(req.params.tid)
    let db = mongoose.connection

    db.collection('players')
      .aggregate([
        {
          $unwind: '$tournaments',
        },
        {
          $lookup: {
            from: 'teams',
            localField: 'team',
            foreignField: '_id',
            as: 'team_info',
          },
        },
        {
          $match: {
            'tournaments.id': mongoose.Types.ObjectId(tournamentId),
          },
        },
      ])
      .toArray()
      .then((docs) => {
        res.json(docs)
      })
  } catch (error) {
    console.log(error)
    throw new Error(error)
  }
})

export const eliminateTeam = asyncHandler(async (req, res) => {
  try {
    let tournamentId = req.params.tid
    const { teamId } = req.body

    let tournament = await Tournament.findById(tournamentId)

    if (!tournament) {
      res.status(404)
      throw new Error('Invalid Tournament ID')
    }

    tournament.eliminated_teams = [...tournament.eliminated_teams, teamId]

    await tournament.save()

    res.status(200)
    res.json(tournament.eliminated_teams)
  } catch (error) {
    throw new Error(error)
  }
})

export const undoEliminateTeam = asyncHandler(async (req, res) => {
  try {
    let tournamentId = req.params.tid
    const { teamId } = req.body

    let tournament = await Tournament.findById(tournamentId)

    if (!tournament) {
      res.status(404)
      throw new Error('Invalid Tournament ID')
    }

    let updatedEliminatedTeams = tournament.eliminated_teams

    updatedEliminatedTeams = updatedEliminatedTeams.filter((team) => {
      return team !== teamId
    })

    tournament.eliminated_teams = updatedEliminatedTeams

    await tournament.save()
    res.status(200)
    res.json(tournament.eliminated_teams)
  } catch (error) {
    throw new Error(error)
  }
})

export const getArcanaLeaderboard = asyncHandler(async (req, res) => {
  try {
    let tournamentId = mongoose.Types.ObjectId(req.params.tid)
    let db = mongoose.connection

    db.collection('users')
      .aggregate([
        {
          $unwind: '$tournaments',
        },
        {
          $match: {
            'tournaments._id': mongoose.Types.ObjectId(tournamentId),
          },
        },
        {
          $project: {
            _id: 1,
            first_name: 1,
            last_name: 1,
            alias: 1,
            'tournaments.points': 1,
            profile_image: 1,
          },
        },
        {
          $sort: {
            'tournaments.points': -1,
          },
        },
      ])
      .toArray()
      .then((docs) => {
        console.log(docs)
        res.json(docs)
      })
  } catch (error) {
    throw new Error(error)
  }
})

export const checkPlayerName = asyncHandler(async (req, res) => {
  try {
    const { matchId } = req.body

    let currentPlayer
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
    for (const player of players) {
      console.log(player.name)
      let playerName = await Player.find({ alias: player.name })
      console.log(playerName)
    }

    res.json('done').status(200)
  } catch (error) {
    throw new Error(error)
  }
})
