const mongoose = require("mongoose")
const Joi = require("joi")


const commentSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "postModel",
        required: true,
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserModel",
        required: true
    },

    text: {
        type: String,
        required: true
    },

    username:{
        type: String,
        required: true
    }
} , {timestamps: true})


const commentModel = mongoose.model("commentModel" , commentSchema)

// validate create comment
function validateCreateComment(obj){
    const schema = Joi.object({
        postId: Joi.string().required(),
        text: Joi.string().trim().required()
    })
    return schema.validate(obj)
} 


// validate update comment
function validateUpdateComment(obj){
    const schema = Joi.object({
        text: Joi.string().trim().required()
    })
    return schema.validate(obj)
} 

module.exports = {
    commentModel,
    validateCreateComment,
    validateUpdateComment
}