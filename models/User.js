const mongoose = require("mongoose")
const Joi = require("joi")
const jwt = require("jsonwebtoken")

// User Schema

const UserSchema = new mongoose.Schema({
    username: {
        type : String,
        required : true,
        trim : true,
        minlength: 3,
        maxlength: 50
    },
    
    email: {
        type : String,
        required : true,
        trim : true,
        unique : true,
    },

    password: {
        type : String,
        required : true,
        trim : true,
        minlength : 8
    },

    profilePhoto : {
        type :  Object,
        default : {
            url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
            publicId : null,
        }
    },
    bio : {
        type : String,
        maxlength : 250
    },

    isAdmin : {
        type : Boolean,
        default : false
    },

    isAccountVerified : {
        type : Boolean,
        default : false
    }
},
{
    timestamps : true,
    toJSON: {virtuals:true},
    toObject: {virtuals: true}
})

UserSchema.virtual("posts" , {
    ref: "postModel",
    foreignField: "user",
    localField: "_id"
})

// Generate Auth Token
UserSchema.methods.generateAuthToken = function(){
    return jwt.sign({id:this._id , isAdmin: this.isAdmin}, process.env.JWT_SECRET , {
        expiresIn: "30d"
    })
}

const UserModel = mongoose.model("UserModel" , UserSchema)

// Vaildate Register user
function VaildateRegisterUser(obj){
    const schema = Joi.object({
        username: Joi.string().trim().min(3).max(50).required(),
        email : Joi.string().trim().required().email(),
        password: Joi.string().trim().min(8).required(),
    })

    return schema.validate(obj)
}

// Vaildate login user
function VaildateLoginUser(obj){
    const schema = Joi.object({
        email : Joi.string().trim().required().email(),
        password: Joi.string().trim().min(8).required(),
    })

    return schema.validate(obj)
}

// Vaildate update user
function VaildateUpdateUser(obj){
    const schema = Joi.object({
        username : Joi.string().trim().min(3).max(50),
        password : Joi.string().trim().min(8),
        bio : Joi.string(),
    })

    return schema.validate(obj)
}

module.exports = {
    UserModel,
    VaildateRegisterUser,
    VaildateLoginUser,
    VaildateUpdateUser
}