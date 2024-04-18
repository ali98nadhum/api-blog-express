const asyncHandler = require("express-async-handler")
const {UserModel, VaildateUpdateUser} = require("../models/User")
const bcrypt = require("bcryptjs")
const path = require("path")
const fs = require("fs")
const {cloudinaryUploadImage , cloudinaryRemovImage , cloudinaryRemovMultipleImage} = require("../utils/cloudinary")
const {commentModel} = require("../models/comment")
const {postModel} = require("../models/post")



// ==================================
// @desc Get all users profile
// @route /api/users/profile
// @method GET
// @access private (only admin)
// ==================================
module.exports.getAllUsers = asyncHandler(async(req , res , next)=>{
    const users = await UserModel.find().select("-password").populate("posts")
    res.status(200).json(users)
})


// ==================================
// @desc Get user profile
// @route /api/users/profile/:id
// @method GET
// @access public
// ==================================
module.exports.getUserProfile = asyncHandler(async(req , res , next)=>{
    const user = await UserModel.findById(req.params.id).select("-password").populate("posts")
    if(!user){
        return res.status(404).json({message: "User not found"})
    }

    res.status(200).json(user)
})


// ==================================
// @desc Update user profile
// @route /api/users/profile/:id
// @method PUT
// @access private (only user himself update)
// ==================================
module.exports.updateUserProfile = asyncHandler(async(req , res , next)=>{
    const {error} = VaildateUpdateUser(req.body)
    if(error){
        return res.status(400).json({message: error.details[0].message})
    }

    if(req.body.password){
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password , salt)
    }

    const updatedUser = await UserModel.findByIdAndUpdate(req.params.id , {
        $set:{
            username: req.body.username,
            password: req.body.password,
            bio: req.body.bio 
        }
    }, {new:true}).select("-password");
    
    res.status(200).json(updatedUser)
})



// ==================================
// @desc this fun for count user number
// @route /api/users/count
// @method GET
// @access private (only admin)
// ==================================
module.exports.getUsersCount = asyncHandler(async(req , res , next)=>{
    const count = await UserModel.countDocuments()
    res.status(200).json(count)
})


// ==================================
// @desc Profile photo upload
// @route /api/users/profile/profile-photo-upload
// @method POST
// @access private (only logged user)
// ==================================
module.exports.profilePhotoUpload = asyncHandler(async(req , res , next)=>{
    // vaildation image
    if(!req.file){
        return res.status(400).json({message: "No file to upload"})
    }
    // get the path image
    const imagePath = path.join(__dirname , `../images/${req.file.filename}`)
    // upload to cloudinary
    const result = await cloudinaryUploadImage(imagePath)
    // get the user from db
    const user = await UserModel.findById(req.user.id)
    // delete the old profile photo if exist 
    if(user.profilePhoto.publicId !== null){
        await cloudinaryRemovImage(user.profilePhoto.publicId)
    }
    // change the profile photo field in  db
    user.profilePhoto = {
        url: result.secure_url,
        publicId: result.public_id
    }
    await user.save()

    res.status(200).json(
        {
            message: "your profile uploaded has successfully" , 
            profilePhoto:{url:result.secure_url , publicId:result.public_id}
        })
    // reomov image from the server
        fs.unlinkSync(imagePath)
})


// ==================================
// @desc delete user profile
// @route /api/users/profile/:id
// @method DELETE  
// @access private (only admin or user himself)
// ==================================
module.exports.deleteUserProfile = asyncHandler(async(req , res , next)=>{
    // get user from db
    const user = await UserModel.findById(req.params.id);
    if(!user){
        return res.status(404).json({message: "User not found"})
    }
    // get all post from db
    const posts = await postModel.find({user: user._id})
    // get the public ids from the posts
    const publicIds = posts?.map((post)=> post.image.publicId)
    // delete all post image from cloudnary that belong to this user
    if(publicIds?.length > 0){
        await cloudinaryRemovMultipleImage(publicIds)
    }
    // delete the profile image from cloudnary
    await cloudinaryRemovImage(user.profilePhoto.publicId)
    // delete user post and comments
    await postModel.deleteMany({user: user._id})
    await commentModel.deleteMany({user:user._id})
    // delete the user himself
    await UserModel.findByIdAndDelete(req.params.id)

    res.status(200).json({message: "your profile has been deleted"})
})