const asyncHandler = require("express-async-handler")
const {categoryModel , validateCreateCategory} = require("../models/category")


// ==================================
// @desc crete new category
// @route /api/categories
// @method POST
// @access private (only admin)
// ==================================
module.exports.createCategory = asyncHandler(async(req , res)=>{
    const {error} = validateCreateCategory(req.body)
    if(error){
        return res.status(400).json({message: error.details[0].message})
    }
    
    const category = await categoryModel.create({
        title: req.body.title,
        user: req.user.id
    })

    res.status(201).json({category})
})



// ==================================
// @desc Get all category
// @route /api/categories
// @method GET
// @access public
// ==================================
module.exports.getAllCategory = asyncHandler(async(req , res)=>{
    const categories = await categoryModel.find()

    res.status(200).json({categories})
})


// ==================================
// @desc delete category
// @route /api/categories/:id
// @method DELETE
// @access private (only admin an delete)
// ==================================
module.exports.deleteCategory = asyncHandler(async(req , res)=>{
    
    const category = await categoryModel.findById(req.params.id)
    if(!category){
        return res.status(404).json({message: "ops can not found this category"})
    }

    await categoryModel.findByIdAndDelete(req.params.id)

    res.status(200).json({message: "category has been deleted"})
})