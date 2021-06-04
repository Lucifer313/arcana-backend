import nodemailer from 'nodemailer'

export const sendConfirmationEmail = (token, recipient_email) => {
  //Setting up the email transporter
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'bhavya.kothari19@gmail.com',
      pass: 'RiverPlate7107_',
    },
  })

  //Setting up the email-confirmation url
  const confirmation_url = `https://localhost:7000/confirmation/${token}`

  //Setting up the email body
  let mailOptions = {
    from: 'Arcana League <verification@arcanaleague.com>',
    to: recipient_email,
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
