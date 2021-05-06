import mongoose from 'mongoose'
import asyncHandler from 'express-async-handler'
import Team from '../models/team-model.js'
import e from 'express'

//Create a New Team //
export const createTeam = asyncHandler(async (req, res) => {
  //Extracting the request body for values
  const {
    name,
    logo,
    region,
    tis_won,
    description,
    creation_date,
    banner_image,
  } = req.body

  try {
    //Creating a new Team object and record at the same time
    const team = await Team.create({
      name,
      region,
      description,
      logo,
      banner_image,
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
    res.json({ teams })
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

    //Extracting the request body for updated values
    const {
      name,
      logo,
      region,
      tis_won,
      description,
      creation_date,
      banner_image,
    } = req.body

    team.name = name
    team.logo = logo
    team.region = region
    team.tis_won = tis_won
    team.description = description
    team.creation_date = creation_date
    team.banner_image = banner_image

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
    throw new Error(error)
  }
})
