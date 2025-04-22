const express = require('express')

const { register, login, forgotPassword, resetPassword } = require('../controllers/auth.controller')


const router = express.Router()


// router.route('/forgotpassword').post(forgotPassword)
router.post('/forgotpassword', forgotPassword)
router.route('/register').post(register)
router.route('/login').post(login)
router.route('/resetpassword/:resettoken').put(resetPassword)

module.exports = router