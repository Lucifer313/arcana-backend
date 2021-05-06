import mongoose from 'mongoose'
import asyncHandler from 'express-async-handler'
import Player from '../models/player-model.js'

export const createPlayer = asyncHandler(async (req, res, next) => {
  const {
    name,
    alias,
    profile_image,
    date_of_birth,
    region,
    country,
    team,
    tis_won,
    prize_money,
  } = req.body

  try {
    const player = await Player.create({
      name,
      alias,
      profile_image,
      date_of_birth,
      region,
      country,
      team,
      tis_won,
      prize_money,
    })

    res.status(201)
    res.json({
      _id: player.id,
      name: player.name,
      alias: player.alias,
      profile_image: player.profile_image,
      date_of_birth: player.date_of_birth,
      region: player.region,
      country: player.country,
      team: player.team,
      tis_won: player.tis_won,
      prize_money: player.prize_money,
    })
  } catch (error) {
    throw new Error(error)
  }
})

export const getPlayers = asyncHandler(async (req, res) => {
  try {
    const players = await Player.find({})

    if (!players) {
      res.status(404)
      throw new Error('No players found')
    }

    res.status(200)
    res.json({ players })
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
      name: player.name,
      alias: player.alias,
      profile_image: player.profile_image,
      date_of_birth: player.date_of_birth,
      region: player.region,
      country: player.country,
      team: player.team,
      tis_won: player.tis_won,
      prize_money: player.prize_money,
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

    if (!player) {
      res.status(404)
      throw new Error('Player not found')
    }

    const {
      name,
      alias,
      profile_image,
      date_of_birth,
      region,
      country,
      team,
      tis_won,
      prize_money,
    } = req.body

    player.name = name
    player.alias = alias
    player.profile_image = profile_image
    player.date_of_birth = date_of_birth
    player.region = region
    player.country = country
    player.team = team
    player.tis_won = tis_won
    player.prize_money = prize_money

    await player.save()

    res.status(200)
    res.json({
      _id: player._id,
      steam_id: player.steam_id,
      name: player.name,
      profile_image: player.profile_image,
      date_of_birth: player.date_of_birth,
      region: player.region,
      country: player.country,
      team: player.team,
      tis_won: player.tis_won,
      prize_money: player.prize_money,
    })
  } catch (error) {
    throw new Error(error)
  }
})
