const express = require('express')

const { register,login,forgotPassword} = require('../controllers/auth.controller')


const router = express.Router()


router.route('/forgotpassword').post(forgotPassword)

router.route('/register').post(register)
router.route('/login').post(login)


module.exports = router