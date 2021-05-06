import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import colors from 'colors'
import path from 'path'

import dbConnect from './config/db.js'

import { routeNotFound, errorHandler } from './middlewares/error-middleware.js'

import teamRoutes from './routes/team-routes.js'
import playerRoutes from './routes/player-routes.js'

//Loading the Dotenv config file//
dotenv.config()

//Connecting the Database
dbConnect()

const app = express()
//Cors package from cross browser resource access//
app.use(cors())

//Parsing the request body to json
app.use(express.json())

app.use('/teams', teamRoutes)
app.use('/players', playerRoutes)

app.use(routeNotFound)
app.use(errorHandler)

try {
  app.listen(process.env.PORT)
  console.log(
    `SERVER RUNNING ON PORT ${process.env.PORT} IN ${process.env.ENVIRONMENT} MODE`
      .yellow.underline
  )
} catch (error) {
  console.error(`Error: ${error}`.bgRed)
  process.exit(1)
}
