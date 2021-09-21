import jwt from 'jsonwebtoken'

export const generateToken = (id, type) => {
  try {
    let expiresIn
    if (type === 'login') {
      expiresIn = '30d'
    } else {
      expiresIn = 600
    }

    return jwt.sign({ id }, process.env.JWTSECRET, {
      expiresIn: expiresIn,
    })
  } catch (error) {
    throw new Error(`Somethign went wrong. Error: ${error}`)
  }
}

export default generateToken
