// middleware/authMiddleware.js
const jwt = require("jsonwebtoken")

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token // from cookie
  if (!token) {
    return res.status(401).json({ message: "Access denied, no token" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" })
  }
}

module.exports = authMiddleware
