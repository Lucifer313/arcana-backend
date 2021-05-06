import mongoose from 'mongoose'

const dbConnect = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useCreateIndex: true,
      useUnifiedTopology: true,
      useNewUrlParser: true,
    })
    console.log(`MongoDB Connected on ${conn.connection.host}`.cyan.underline)
  } catch (error) {
    console.error(`Error: ${error}`.red.underline)
    process.exit(1)
  }
}

export default dbConnect
