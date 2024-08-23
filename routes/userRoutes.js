const express = require('express')

// Controller functions
const { signupUser, loginUser, forgotPassword, resetPassword } = require('../controllers/userControllers')

const router = express.Router()

// login route
router.post('/login', loginUser)

// sign up route
router.post('/signup', signupUser)

router.post('/forgotPassword', forgotPassword)
router.patch('/resetPassword/:token', resetPassword)

module.exports = router