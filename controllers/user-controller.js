import mongoose from 'mongoose'
import asyncHandler from 'express-async-handler'
import nodemailer from 'nodemailer'
import Moment from 'moment'

import generateToken from '../utils/generate-token.js'
import { sendConfirmationEmail } from '../utils/send-email.js'

import User from '../models/user-model.js'
import Tournament from '../models/torunament-model.js'

export const registerUser = asyncHandler(async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    password,
    date_of_birth,
    alias,
    country,
  } = req.body

  //Logic to check if email address alread
  const user = await User.findOne({ email })

  if (user) {
    res.status(500)
    throw new Error('Email Address already in use')
  }

  try {
    const user = await User.create({
      first_name,
      last_name,
      email,
      password,
      date_of_birth,
      alias,
      country,
      profile_image: 'http://gg.png',
    })

    //Generating jwt_token for email and response
    const jwt_token = generateToken(user._id)

    //Sending confirmation email
    sendConfirmationEmail(jwt_token, email)

    res
      .json({
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        date_of_birth: user.date_of_birth,
        alias: user.alias,
        country: user.country,
        profile_image: user.profile_image,
        token: jwt_token,
      })
      .status(201)
  } catch (error) {
    console.log(error)
    throw new Error(error)
  }
})

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })

    if (user && (await user.matchPassword(password))) {
      res
        .json({
          _id: user._id,
          name: user.name,
          email: user.email,
          alias: user.alias,
          role: user.role,
          contact: user.contact,
          date_of_birth: user.date_of_birth,
          country: user.country,
          profile_image: user.profile_image,
          tournaments: user.tournaments,
          token: generateToken(user._id),
        })
        .status(200)
    } else {
      res.status(404)
      throw new Error('Invalid email or password')
    }
  } catch (error) {
    throw new Error(error)
  }
})

export const getUserById = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (!user) {
      res.status(404)
      throw new Error('No user found')
    }

    res
      .json({
        _id: user._id,
        name: user.name,
        email: user.email,
        alias: user.alias,
        role: user.role,
        contact: user.contact,
        date_of_birth: user.date_of_birth,
        country: user.country,
        profile_image: user.profile_image,
      })
      .status(200)
  } catch (error) {
    throw new Error(error)
  }
})

export const updateUserById = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const { name, alias, contact, date_of_birth, profile_image } = req.body

    if (!user) {
      res.status(404)
      throw new Error('Invalid user id')
    }

    user.name = name
    user.alias = alias
    user.contact = contact
    user.date_of_birth = date_of_birth
    user.profile_image = profile_image

    await user.save()

    res
      .json({
        _id: user._id,
        name: user.name,
        email: user.email,
        alias: user.alias,
        contact: user.contact,
        role: user.role,
        date_of_birth: user.date_of_birth,
        country: user.country,
        profile_image: user.profile_image,
      })
      .status(200)
  } catch (error) {
    throw new Error(error)
  }
})

export const createArcanaTeam = asyncHandler(async (req, res) => {
  try {
    const tournamentId = req.params.tid
    const tournament = await Tournament.findById(tournamentId)

    if (!tournament) {
      res.status(404)
      throw new Error('Invalid Tournament ID')
    }

    const { userId, teamPrediction, arcanaTeam } = req.body
    let user = await User.findById(userId)

    if (!user) {
      res.status(404)
      throw new Error('Invalid User ID')
    }

    let newTournament = {
      _id: tournamentId,
      arcanaTeam,
      teamPrediction,
      days: [],
    }

    user.tournaments = [...user.tournaments, newTournament]
    await user.save()
  } catch (error) {
    throw new Error(error)
  }
})

export const getMyTournaments = asyncHandler(async (req, res) => {
  try {
    let userId = req.params.uid

    let user = await User.findById(userId)

    if (!user) {
      res.status(404)
      throw new Error('Invalid User ID')
    }

    res.status(200)
    res.json(user.tournaments)
  } catch (error) {
    throw new Error(error)
  }
})

export const addMyPlayingSquad = asyncHandler(async (req, res) => {
  try {
    //Variable for adding new Record
    let newDay

    const userId = req.params.uid

    let user = await User.findById(userId)

    if (!user) {
      res.status(404)
      throw new Error('Invalid User Id')
    }

    const { tournamentId, playingSquad, reserveSquad, addedAt } = req.body
    //Extracting the days array from the selected Tournament
    let currentTournament = await user.tournaments.filter(
      (tournament) => tournament._id == tournamentId
    )[0]
    console.log(currentTournament)
    let { days } = currentTournament

    //Creating a new Day object
    newDay = {
      day: days.length + 1,
      playingSquad,
      reserveSquad,
      addedAt,
    }
    //Appending the new day to the list of days
    currentTournament.days = [...days, newDay]

    //Getting the other tournaments into a new array
    let updatedTournaments = user.tournaments.filter(
      (tournament) => tournament._id != tournamentId
    )

    console.log(updatedTournaments.length)

    //Combining other tournaments with updated tournament
    updatedTournaments = [...updatedTournaments, currentTournament]

    console.log(updatedTournaments.length)

    //Assigning the updated tournament to the user
    user.tournaments = updatedTournaments
    await user.save()
    res.json({ currentTournament })
  } catch (error) {
    console.log(error)
    throw new Error(error)
  }
})

export const allowAddingSquad = asyncHandler(async (req, res) => {
  try {
    let userId = req.params.uid
    let allowed
    let user = await User.findById(userId)

    if (!user) {
      res.status(404)
      throw new Error('Invalid User ID')
    }

    let { tournamentId } = req.body
    //Getting the concerned tournament Object
    let tournament = user.tournaments.filter((t) => t._id == tournamentId)[0]
    //Extracting the days from the tournament object
    let { days } = tournament

    //If days already exist then check for the previous day timestamps
    if (days.length > 0) {
      //Extracting the addedAt of the Last squad added
      let lastSquadAddedAt = days[days.length - 1].addedAt

      //Calculating the current time in Moment
      let currentMoment = Moment().format('MM-DD-YYYY, h:mm:ss a')

      let ms = Moment(currentMoment, 'MM-DD-YYYY, h:mm:ss a').diff(
        Moment(lastSquadAddedAt, 'MM-DD-YYYY, h:mm:ss a').toISOString()
      )
      const d = Moment.duration(ms)
      const num_hours = d._data.hours
      const num_days = d._data.days

      if (num_hours < 12 && num_days == 0) {
        allowed = false
      } else {
        allowed = true
      }
    } else {
      allowed = true
    }

    res.json(allowed)

    //let currentMoment = Moment().format('MM DD YYYY, h:mm:ss a')
  } catch (error) {
    console.log(error)
    throw new Error(error)
  }
})
