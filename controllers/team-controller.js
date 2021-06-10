import mongoose from 'mongoose'
import asyncHandler from 'express-async-handler'
import Team from '../models/team-model.js'
import Player from '../models/player-model.js'
import fs from 'fs'

//Create a New Team //
export const createTeam = asyncHandler(async (req, res) => {
  //Extracting the request body for values
  const { name, region, description, tis_won, creation_date } = req.body

  try {
    //Creating a new Team object and record at the same time
    const team = await Team.create({
      name,
      region,
      description,
      logo: req.file.path,
      banner_image: 'http://bannergg.png',
      tis_won,
      creation_date,
    })

    //Sending responses
    res.status(201)
    res.json({
      _id: team._id,
      name: team.name,
      region: team.region,
      description: team.description,
      logo: team.logo,
      banner_image: team.banner_image,
      tis_won: team.tis_won,
      creation_date: team.creation_date,
    })
  } catch (error) {
    console.log(error)
    throw new Error(error)
  }
})

//Get All Teams//
export const getTeams = asyncHandler(async (req, res, next) => {
  try {
    //Getting all the Teams from the DB
    const teams = await Team.find({})

    //Sending responses
    res.status(200)
    res.json(teams)
  } catch (error) {
    throw new Error(error)
  }
})

export const getTeamById = asyncHandler(async (req, res, next) => {
  //Extracting the Team ID from the URL parameters
  const team_id = req.params.tid

  try {
    //Finding the team for the provided ID
    const team = await Team.findById(team_id)

    //Throwing error if the Team for the provided ID was not found
    if (!team) {
      res.status(404)
      throw new Error('Team not found')
    }

    //Else sending responses
    res.status(200)
    res.json(team)
  } catch (error) {
    throw new Error(error)
  }
})

export const deleteTeamById = asyncHandler(async (req, res, next) => {
  //Extracting the Team ID from the URL parameters
  const team_id = req.params.tid

  try {
    //Finding the team for the provided ID
    const team = await Team.findById(team_id)

    //Throwing error if the Team for the provided ID was not found
    if (!team) {
      res.status(404)
      throw new Error('Team not found')
    } else {
      fs.unlink(team.logo, (error) => {
        console.log(error)
      })
    }
    //Deleting the team
    await team.remove()

    //Sending responses
    res.status(200)
    res.json({
      _id: team._id,
    })
  } catch (error) {
    throw new Error(error)
  }
})

export const updateTeamById = asyncHandler(async (req, res) => {
  const team_id = req.params.tid

  try {
    //Finding the team for the provided ID
    const team = await Team.findById(team_id)

    //Throwing error if the Team for the provided ID was not found
    if (!team) {
      res.status(404)
      throw new Error('Team not found')
    }

    //Getting the previous path of the logo
    const previousLogoFile = team.logo

    //Extracting the request body for updated values
    const {
      name,
      region,
      description,
      tis_won,
      creation_date,
      //banner_image,
    } = req.body

    team.name = name
    team.region = region
    team.tis_won = tis_won
    team.description = description
    team.creation_date = creation_date
    team.banner_image = 'http://banner.png'

    //Only if image is changed
    if (req.file) {
      team.logo = req.file.path
      fs.unlink(previousLogoFile, (error) => {
        console.log(error)
      })
    }

    await team.save()

    res.status(200)
    res.json({
      _id: team._id,
      name: team.name,
      region: team.region,
      description: team.description,
      logo: team.logo,
      banner_image: team.banner_image,
      tis_won: team.tis_won,
      creation_date: team.creation_date,
    })
  } catch (error) {
    console.log(error)
    throw new Error(error)
  }
})

export const getTeamPlayers = asyncHandler(async (req, res) => {
  const team_id = req.params.tid

  try {
    const players = await Player.find({ team: team_id })

    if (!players) {
      res.status(404)
      throw new Error('No players found for the given team')
    }

    res.status(200)
    res.json({ players })
  } catch (error) {
    throw new Error(error)
  }
})
