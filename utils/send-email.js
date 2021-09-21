import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

export const sendConfirmationEmail = (token) => {
  //Setting up the email transporter

  console.log(process.env.EMAIL_ADDRESS)

  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD,
    },
  })

  //Setting up the email-confirmation url
  const confirmation_url = `${process.env.BASE_URL}/confirmation/${token}`

  //Setting up the email body
  let mailOptions = {
    from: 'Arcana League <verification@arcanaleague.com>',
    to: 'bhavya.kothari19@gmail.com',
    subject: 'Email verification for Arcana League',
    html: `Please click on this link to confirm your email address <a href="${confirmation_url}">${confirmation_url}</a>`,
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error)
    } else {
      console.log(info)
    }
  })
}
