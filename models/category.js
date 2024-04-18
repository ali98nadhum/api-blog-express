const mongoose = require("mongoose");
const Joi = require("joi");

const categorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const categoryModel = mongoose.model("categoryModel" , categorySchema)


function validateCreateCategory(obj){
    const schema = Joi.object({
        title: Joi.string().required().trim()
    })

    return schema.validate(obj)
}


module.exports = {
    categoryModel,
    validateCreateCategory
}