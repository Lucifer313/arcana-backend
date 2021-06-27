import mongoose from 'mongoose'
import asyncHandler from 'express-async-handler'
import nodemailer from 'nodemailer'

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
