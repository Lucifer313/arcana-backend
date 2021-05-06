export const routeNotFound = (req, res, next) => {
  res.status(404)
  const error = new Error(`Route not found : ${req.originalUrl}`)
  next(error)
}

export const errorHandler = (error, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode
  res.status(statusCode)
  res.json({
    message: error.message,
    stack: process.env.ENVIRONMENT === 'DEVELOPMENT' ? error.stack : null,
  })
}
