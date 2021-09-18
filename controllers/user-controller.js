import asyncHandler from 'express-async-handler'
import nodemailer from 'nodemailer'
import Moment from 'moment'
import mongoose from 'mongoose'

import generateToken from '../utils/generate-token.js'
import { sendConfirmationEmail } from '../utils/send-email.js'

import User from '../models/user-model.js'
import Tournament from '../models/torunament-model.js'
import Player from '../models/player-model.js'

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
      //end_date: tournament.end_date
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
    const db = mongoose.connection

    let { tournamentId, playingSquad, reserveSquad, addedAt } = req.body

    let newDay

    const dayNum = db
      .collection('users')
      .aggregate([
        {
          $unwind: '$tournaments',
        },
        {
          $match: {
            _id: mongoose.Types.ObjectId(req.params.uid),
            'tournaments._id': mongoose.Types.ObjectId(tournamentId),
          },
        },
      ])
      .toArray()

    playingSquad = playingSquad.map((p) => {
      return mongoose.Types.ObjectId(p)
    })

    reserveSquad = reserveSquad.map((p) => {
      return mongoose.Types.ObjectId(p)
    })

    dayNum.then((value) => {
      let {
        tournaments: { days },
      } = value[0]
      console.log(days.length)
      newDay = {
        day: days.length + 1,
        playingSquad,
        reserveSquad,
        addedAt,
      }
      //Inserting the new Squad
      db.collection('users')
        .updateOne(
          {
            _id: mongoose.Types.ObjectId(req.params.uid),
            'tournaments._id': mongoose.Types.ObjectId(tournamentId),
          },
          {
            $push: {
              'tournaments.$.days': newDay,
            },
          }
        )
        .then(() => {
          //Fetching the new Squad Details and sending it as a response
          db.collection('players')
            .aggregate([
              {
                $facet: {
                  playingSquadDetails: [
                    {
                      $match: {
                        _id: { $in: playingSquad },
                      },
                    },
                    {
                      $project: {
                        tournaments: 0,
                        date_of_birth: 0,
                        region: 0,
                        country: 0,
                        tis_won: 0,
                      },
                    },
                  ],
                  reserveSquadDetails: [
                    {
                      $match: {
                        _id: { $in: reserveSquad },
                      },
                    },
                    {
                      $project: {
                        tournaments: 0,
                        date_of_birth: 0,
                        region: 0,
                        country: 0,
                        tis_won: 0,
                      },
                    },
                  ],
                },
              },
            ])
            .toArray()
            .then((squad) => {
              res.status(200)
              res.json({
                playingSquad: squad[0].playingSquadDetails,
                reserveSquad: squad[0].reserveSquadDetails,
              })
            })
        })
    })
  } catch (error) {
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
  } catch (error) {
    throw new Error(error)
  }
})

export const getSquadByDay = asyncHandler(async (req, res) => {
  try {
    let userId = req.params.uid
    //Getting the user
    let user = await User.findById(userId)

    if (!user) {
      res.status(404)
      throw new Error('Invalid User ID')
    }

    const { tournamentId, day } = req.body
    //console.log('Day: ' + day)
    //Getting the selected tournament for the user
    let tournament = user.tournaments.filter((t) => t._id == tournamentId)[0]
    if (!tournament) {
      res.status(404)
      throw new Error('Invalid Tournament ID')
    }
    //Getting the selected day for the selected tournament
    let { days } = tournament

    let selectedDay = days.filter((d) => d.day == day)[0]
    //Sending the playing Squad and reserve Squad for that selected day
    if (!selectedDay) {
      res.status(404)
      throw new Error('Invalid Day selection')
    }

    let db = mongoose.connection

    let playSquad = selectedDay.playingSquad.map((s) =>
      mongoose.Types.ObjectId(s)
    )

    let resSquad = selectedDay.reserveSquad.map((s) =>
      mongoose.Types.ObjectId(s)
    )

    console.log(resSquad)
    //Getting previous squads is mode is previous
    //  if (mode === 'previous') {
    db.collection('players')
      .aggregate([
        {
          $facet: {
            playingSquadDetails: [
              {
                $unwind: '$tournaments',
              },
              {
                $unwind: '$tournaments.points',
              },
              {
                $match: {
                  _id: {
                    $in: playSquad,
                  },
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
                  role: { $first: '$role' },
                  tournamentId: { $first: '$tournaments.id' },
                  profile_image: { $first: '$profile_image' },
                },
              },
              {
                $sort: {
                  dayPoints: -1,
                },
              },
            ],
            reserveSquadDetails: [
              {
                $unwind: '$tournaments',
              },
              {
                $unwind: '$tournaments.points',
              },
              {
                $match: {
                  _id: {
                    $in: resSquad,
                  },
                  //  'tournaments.id': mongoose.Types.ObjectId(tournamentId),
                  //    'tournaments.points.dayNum': day,
                },
              },
              {
                $group: {
                  _id: '$_id',
                  dayPoints: {
                    $sum: '$tournaments.points.points',
                  },
                  alias: { $first: '$alias' },
                  role: { $first: '$role' },
                  tournamentId: { $first: '$tournaments.id' },
                  profile_image: { $first: '$profile_image' },
                },
              },
              {
                $sort: {
                  dayPoints: -1,
                },
              },
            ],
          },
        },
      ])
      .toArray()
      .then((squad) => {
        res.status(200)
        console.log(squad)
        res.json({
          playingSquadIds: selectedDay.playingSquad,
          reserveSquadIds: selectedDay.reserveSquad,
          playingSquad: squad[0].playingSquadDetails,
          reserveSquad: squad[0].reserveSquadDetails,
        })
      })
  } catch (error) {
    throw new Error(error)
  }
})
