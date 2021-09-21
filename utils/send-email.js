import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

export const sendEmail = (recipient, message) => {
  //Setting up the email transporter

  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD,
    },
  })

  let mailOptions = {
    from: 'Arcana League <verification@arcanaleague.com>',
    to: 'bhavya.kothari19@gmail.com',
    subject: 'Email verification for Arcana League',
    html: message,
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error)
    } else {
      console.log('Email sent')
    }
  })
}
