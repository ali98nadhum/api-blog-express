const asyncHandler = require("express-async-handler")
const bcrypt = require("bcryptjs")
const {UserModel , VaildateRegisterUser , VaildateLoginUser}= require("../models/User")


// ==================================
// @desc Register New User
// @route /api/auth/register
// @method POST
// @access Public
// ==================================
module.exports.RegisterUser = asyncHandler(async(req , res , next)=>{
    // validation user data
    const {error} = VaildateRegisterUser(req.body)
    if(error){
        return res.status(400).json({message: error.details[0].message})
    }
    // is user exist ?
    let user = await UserModel.findOne({email:req.body.email})
    if(user){
        return res.status(400).json({message: "User already register"})
    }
    // hash the password
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(req.body.password , salt)
    
    // make new user
    user = new UserModel({
        username: req.body.username,
        email : req.body.email,
        password : hashPassword
    })
    // save to db
    await user.save()

    res.status(201).json({message: "You registered successfully , please login"})

})



// ==================================
// @desc Login user
// @route /api/auth/login
// @method POST
// @access Public
// ==================================
module.exports.loginUser = asyncHandler(async(req , res ,next)=>{
    // 1- Validation
    const {error} = VaildateLoginUser(req.body)
    if(error){
        return res.status(400).json({message: error.details[0].message})
    }
    // 2- is user exist ?
    const user = await UserModel.findOne({email: req.body.email})
    if(!user){
        return res.status(400).json({message: "invalid email or password"})
    }
    // 3- check the password
    const isPasswordMatch = await bcrypt.compare(req.body.password , user.password)
    if(!isPasswordMatch){
        return res.status(400).json({message: "invalid email or password"})
    }
    // 4- Generate token
    const token = user.generateAuthToken();

    res.status(200).json({
        _id: user._id,
        isAdmin: user.isAdmin,
        profilePhoto : user.profilePhoto,
        token,
    })
})