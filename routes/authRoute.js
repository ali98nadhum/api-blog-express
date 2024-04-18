const router = require("express").Router()
const {RegisterUser, loginUser} = require("../controllers/authControllers")


// api/auth/register
router.post("/register" , RegisterUser)
router.post("/login" , loginUser)

module.exports = router

