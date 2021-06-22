import mongoose from 'mongoose'
import asyncHandler from 'express-async-handler'
import Player from '../models/player-model.js'
import fs from 'fs'

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
