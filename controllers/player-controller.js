import mongoose from 'mongoose'
import asyncHandler from 'express-async-handler'
import Player from '../models/player-model.js'
import fs from 'fs'
import Moment from 'moment'
import axios from 'axios'

export const createPlayer = asyncHandler(async (req, res, next) => {
  const { alias, role, date_of_birth, region, country, team, tis_won } =
    req.body

  try {
    const player = await Player.create({
      alias,
      role,
      profile_image: req.file.path,
      date_of_birth,
      region,
      country,
      team,
      tis_won,
    })

    res.status(201)
    res.json({
      _id: player.id,
      alias: player.alias,
      role: player.role,
      profile_image: player.profile_image,
      date_of_birth: player.date_of_birth,
      region: player.region,
      country: player.country,
      team: player.team,
      tis_won: player.tis_won,
    })
  } catch (error) {
    throw new Error(error)
  }
})

export const getPlayers = asyncHandler(async (req, res) => {
  try {
    const players = await Player.find({}).populate('team')

    if (!players) {
      res.status(404)
      throw new Error('No players found')
    }

    res.status(200)
    res.json(players)
  } catch (error) {
    throw new Error(error)
  }
})

export const getPlayerById = asyncHandler(async (req, res) => {
  const player_id = req.params.pid

  try {
    const player = await Player.findById(player_id)

    if (!player) {
      res.status(404)
      throw new Error('Player not found')
    }

    res.status(200)
    res.json({
      _id: player._id,
      alias: player.alias,
      role: player.role,
      profile_image: player.profile_image,
      date_of_birth: player.date_of_birth,
      region: player.region,
      country: player.country,
      team: player.team,
      tis_won: player.tis_won,
    })
  } catch (error) {
    throw new Error(error)
  }
})

export const deletePlayerById = asyncHandler(async (req, res) => {
  const player_id = req.params.pid

  try {
    const player = await Player.findById(player_id)

    if (!player) {
      res.status(404)
      throw new Error('Player not found')
    }

    await player.remove()

    res.status(200)
    res.json({
      _id: player._id,
    })
  } catch (error) {
    throw new Error(error)
  }
})

export const updatePlayerById = asyncHandler(async (req, res, next) => {
  const player_id = req.params.pid

  try {
    const player = await Player.findById(player_id)

    const previousImagePath = player.profile_image

    if (!player) {
      res.status(404)
      throw new Error('Player not found')
    }

    const { alias, role, date_of_birth, region, country, team, tis_won } =
      req.body

    player.alias = alias
    player.role = role
    player.date_of_birth = date_of_birth
    player.region = region
    player.country = country
    player.team = team
    player.tis_won = tis_won

    //Only if image is passed as a part of the update
    if (req.file) {
      player.profile_image = req.file.path
      fs.unlink(previousImagePath, (error) => {
        console.log(error)
      })
    }

    await player.save()

    res.status(200)
    res.json({
      _id: player._id,
      profile_image: player.profile_image,
      date_of_birth: player.date_of_birth,
      region: player.region,
      country: player.country,
      team: player.team,
      tis_won: player.tis_won,
    })
  } catch (error) {
    console.log(error)
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

export const getPlayerLeaderboard = asyncHandler(async (req, res) => {
  try {
    const tournamentId = mongoose.Types.ObjectId(req.params.tid)

    let playerList = await Player.find({
      $and: [{ 'tournaments.id': tournamentId }],
    })
      .select('alias tournaments team _id profile_image')
      .sort({ 'tournaments.total_points': '-1' })

    playerList.forEach((player) => {
      player.tournaments = player.tournaments.filter(
        (p) => p.id == req.params.tid
      )
    })
    /* let db = mongoose.connection

    db.collection('players')
      .aggregate([
        {
          $match: {
            'tournaments.id': mongoose.Types.ObjectId(
              '60e1c8180c36a854dcc317f9'
            ),
          },
        },
        {
          $project: {
            ROOT: {
              $filter: {
                input: '$tournaments',
                as: 'tournaments',
                cond: {
                  $and: [
                    {
                      $eq: [
                        '$$tournaments.id',
                        mongoose.Types.ObjectId('60e1c8180c36a854dcc317f9'),
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
      ])
      .toArray()
      .then((docs) => {
        res.json(docs)
      })*/
    res.json(playerList)
  } catch (error) {
    throw new Error(error)
  }
})
