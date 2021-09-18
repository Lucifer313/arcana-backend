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

//Get Player points by Day
export const getSinglePlayerPointsByDay = asyncHandler(async (req, res) => {
  try {
    let playerID = mongoose.Types.ObjectId(req.params.pid)

    const { tournamentId, day } = req.body

    let db = mongoose.connection

    db.collection('players')
      .aggregate([
        {
          $unwind: '$tournaments',
        },
        {
          $unwind: '$tournaments.points',
        },
        {
          $match: {
            _id: playerID,
            'tournaments.id': mongoose.Types.ObjectId(tournamentId),
            'tournaments.points.dayNum': day,
          },
        },
        /* {
          $group: {
            _id: '$_id',
            dayPoints: {
              $sum: '$tournaments.points.points',
            },
            alias: { $first: '$alias' },
            tournamentId: { $first: '$tournaments.id' },
          },
        },*/
        {
          $project: {
            _id: 1,
            tournaments: 1,
            alias: 1,
            profile_image: 1,
          },
        },
      ])
      .toArray()
      .then((docs) => {
        res.json(docs)
      })
  } catch (error) {
    throw new Error(error)
  }
})

//Get Player points by Day
export const getPlayersPointsByDay = asyncHandler(async (req, res) => {
  try {
    //let playerID = mongoose.Types.ObjectId(req.params.pid)
    let tournamentId = req.params.tid
    let { day, selectedPlayers } = req.body

    selectedPlayers = selectedPlayers.map((player) => {
      return mongoose.Types.ObjectId(player)
    })

    let db = mongoose.connection

    db.collection('players')
      .aggregate([
        {
          $unwind: '$tournaments',
        },
        {
          $unwind: '$tournaments.points',
        },
        {
          $match: {
            _id: { $in: selectedPlayers },
            'tournaments.id': mongoose.Types.ObjectId(tournamentId),
            'tournaments.points.dayNum': day,
          },
        },
        {
          $group: {
            _id: '$_id',
            dayPoints: {
              $sum: '$tournaments.points.points',
            },
            alias: { $first: '$alias' },
            tournamentId: { $first: '$tournaments.id' },
            profile_image: { $first: '$profile_image' },
          },
        },
        /*{
          $project: {
            _id: 1,
            tournaments: 1,
            alias: 1,
            profile_image: 1,
          },
        },*/
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
