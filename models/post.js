const mongoose = require("mongoose");
const Joi = require("joi");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 250,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    image: {
      type: Object,
      default: {
        url: "",
        publicId: null,
      },
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserModel",
      },
    ],
  },
  { 
    timestamps: true,
    toJSON: {virtuals:true},
    toObject: {virtuals:true}
  }
);

// popilate comment for this post
postSchema.virtual("comments" , {
  ref: "commentModel",
  foreignField: "postId",
  localField: "_id"
})

const postModel = mongoose.model("postModel" , postSchema)

// ValidateCreatPost
function validateCreatPost(obj){
    const schema = Joi.object({
        title: Joi.string().trim().min(2).max(100).required(),
        description : Joi.string().trim().min(10).max(250).required(),
        category : Joi.string().trim().required()
    })

    return schema.validate(obj)
}


// ValidateUpdatePost
function validateUpdatePost(obj){
    const schema = Joi.object({
        title: Joi.string().trim().min(2).max(100),
        description : Joi.string().trim().min(10).max(250),
        category : Joi.string().trim()
    })

    return schema.validate(obj)
}

module.exports = {
    postModel,
    validateCreatPost,
    validateUpdatePost
}