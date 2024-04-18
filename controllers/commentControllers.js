const asyncHandler = require("express-async-handler")
const {commentModel , validateCreateComment , validateUpdateComment} = require("../models/comment")
const {UserModel} = require("../models/User")




// ==================================
// @desc crete new cooment
// @route /api/comment
// @method POST
// @access private (only logged user)
// ==================================
module.exports.createComment = asyncHandler(async(req , res)=>{
    const {error} = validateCreateComment(req.body)
    if(error){
        return res.status(400).json({message: error.details[0].message})
    }

    const profile = await UserModel.findById(req.user.id)

    const comment = await commentModel.create({
        postId: req.body.postId,
        text: req.body.text,
        user: req.user.id,
        username: profile.username,
    })

    res.status(201).json(comment)
})


// ==================================
// @desc Get all comment
// @route /api/comments
// @method GET
// @access private (only admin)
// ==================================
module.exports.getAllComment = asyncHandler(async(req , res)=>{
    const comments = await commentModel.find().populate("user")
    res.status(200).json(comments)
})



// ==================================
// @desc Delete comment
// @route /api/comments/:id
// @method DELETE
// @access private (only admin or owner of the comment)
// ==================================
module.exports.deleteComment = asyncHandler(async(req , res)=>{

    const comment = await commentModel.findById(req.params.id)
    if(!comment){
        return res.status(404).json({message: "Comment not found"})
    }

    if(req.user.isAdmin || req.user.id === comment.user.toString()){
        await commentModel.findByIdAndDelete(req.params.id)
        res.status(200).json({message: "Comment has been deleted"})
    }else{
        res.status(403).json({message: "Cant delete this comment"})
    }

    
})


// ==================================
// @desc Update comment
// @route /api/comments/:id
// @method PUT
// @access private (only user of the comment)
// ==================================
module.exports.updateComment = asyncHandler(async(req , res)=>{
    const {error} = validateUpdateComment(req.body);
    if(error){
        return res.status(400).json({message: error.details[0].message})
    }

    const comment = await commentModel.findById(req.params.id);
    if(!comment){
        return res.status(404).json({message: "Comment not found"})
    }

    if(req.user.id !== comment.user.toString()){
        return res.status(403).json({message: "you cant update this comment"})
    }

    const updatedComment = await commentModel.findByIdAndUpdate(req.params.id, {
        $set: {
            text: req.body.text
        }
    },{new: true})

    res.status(200).json(updatedComment)
})