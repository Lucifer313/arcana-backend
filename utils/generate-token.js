import jwt from 'jsonwebtoken'

const generateToken = (id) => {
  try {
    return jwt.sign({ id }, process.env.JWTSECRET, {
      expiresIn: '30d',
    })
  } catch (error) {
    throw new Error(`Somethign went wrong. Error: ${error}`)
  }
}

export default generateToken
