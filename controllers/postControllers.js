const fs = require("fs");
const path = require("path");
const asyncHandler = require("express-async-handler");
const { postModel, validateCreatPost, validateUpdatePost } = require("../models/post");
const { cloudinaryUploadImage, cloudinaryRemovImage } = require("../utils/cloudinary");
const {commentModel} = require("../models/comment")

// ==================================
// @desc Create new post
// @route /api/posts
// @method POST
// @access private (only logged user)
// ==================================
module.exports.createNewPost = asyncHandler(async (req, res, next) => {
  // vaildation for image
  if (!req.file) {
    return res.status(400).json({ message: "please insert image" });
  }
  // vaildation for data
  const { error } = validateCreatPost(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  // upload image
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUploadImage(imagePath);
  // create new post and save to db
  const post = await postModel.create({
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    user: req.user.id,
    image: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });
  res.status(201).json(post);
  // reomve image from the server
  fs.unlinkSync(imagePath);
});

// ==================================
// @desc Get all post
// @route /api/posts
// @method GET
// @access public
// ==================================
module.exports.getAllPost = asyncHandler(async (req, res) => {
  const post_per_page = 3;
  const { pageNumber, category } = req.query;
  let posts;

  if (pageNumber) {
    // باجنيشن
    posts = await postModel
      .find()
      .skip((pageNumber - 1) * post_per_page)
      .limit(post_per_page)
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]);
    // يجيب البوست حسب الكاتوكري
  } else if (category) {
    posts = await postModel
      .find({ category: category })
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]);
  } else {
    // يجيب كل البوست اذا ماكو طلبات معينه
    posts = await postModel
      .find()
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]);
  }
  res.status(200).json(posts);
});



// ==================================
// @desc Get singel post
// @route /api/posts/:id
// @method GET
// @access public
// ==================================
module.exports.getSingelPost = asyncHandler(async (req, res) => {
   const post = await postModel.findById(req.params.id).populate("user", ["-password"]).populate("comments")
   if(!post){
    return res.status(404).json({message: "Post not found"})
   }
    res.status(200).json(post);
  });
  


// ==================================
// @desc Get post count
// @route /api/posts/count
// @method GET
// @access public
// ==================================
module.exports.getPostCount = asyncHandler(async (req, res) => {
    const count = await postModel.countDocuments()
     res.status(200).json(count);
   });
   


// ==================================
// @desc Delete post
// @route /api/posts/:id
// @method DELETE
// @access private (only admin or user of the post)
// ==================================
module.exports.deletePost = asyncHandler(async (req, res) => {
    const post = await postModel.findById(req.params.id)
    if(!post){
     return res.status(404).json({message: "Post not found"})
    }

    if(req.user.isAdmin || req.user.id === post.user.toString()){
        await postModel.findByIdAndDelete(req.params.id)
        await cloudinaryRemovImage(post.image.publicId)
        // delete all comment for post
        await commentModel.deleteMany({postId: post._id}) 
        res.status(200).json({message: "Post has been deleted successfuly" , postId: post._id})
    }else{
        res.status(403).json({message: "cant delete this post"})
    }
     
   });



// ==================================
// @desc update post
// @route /api/posts/:id
// @method PUT
// @access private (only owner of the post)
// ==================================
module.exports.updatePost = asyncHandler(async(req , res)=>{
    // validation 
    const {error} = validateUpdatePost(req.body)
    if(error){
        return res.status(400).json({message: error.details[0].message})
    }
    
    // get post from db and check of post exist
    const post = await postModel.findById(req.params.id);
    if(!post){
        return res.status(404).json({message: "post not found"})
    }

    // check if this post to logged user
    if(req.user.id !== post.user.toString()){
        return res.status(403).json({message: "cant update this post"})
    }

    // update post
    const updatPost = await postModel.findByIdAndUpdate(req.params.id , {
        $set:{
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
        }
    },{new: true}).populate("user", ["-password"])

    res.status(200).json(updatPost)
})


// ==================================
// @desc update post image
// @route /api/posts/upload-image/:id
// @method PUT
// @access private (only owner of the post)
// ==================================
module.exports.updatePostImage = asyncHandler(async(req , res)=>{
    // validation
    if(!req.file){
        return res.status(400).json({message: "no image for upload"})
    }

    // get the post from db and check if post exist
    const post = await postModel.findById(req.params.id)
    if(!post){
        return res.status(404).json({message: "post not found"})
    }

    // check if this post to logged user
    if(req.user.id !== post.user.toString()){
        return res.status(403).json({message: "cant update this post"})
    }

    // delete the old image image
    await cloudinaryRemovImage(post.image.publicId)

    // upload new image
    const imagePath = path.join(__dirname , `../images/${req.file.filename}`)
    const result = await cloudinaryUploadImage(imagePath)

    // update image filed in the db
    const updatPost = await postModel.findByIdAndUpdate(req.params.id , {
        $set:{
            image: {
                url: result.secure_url,
                publicId: result.public_id
            }
        }
    },{new: true})

    res.status(200).json(updatPost)

    // delete image from server
    fs.unlinkSync(imagePath)
})


// ==================================
// @desc Toggle like
// @route /api/posts/like/:id
// @method PUT
// @access private (only logged user)
// ==================================
module.exports.toggleLike = asyncHandler(async(req , res)=>{
    let post = await postModel.findById(req.params.id);
    if(!post){
        return res.status(404).json({message: "post not found"})
    }

    const isPostAlreadyLiked = post.likes.find((user)=>user.toString() === req.user.id)

    if(isPostAlreadyLiked){
        post = await postModel.findByIdAndUpdate(req.params.id ,{
            $pull: {likes: req.user.id}
        }, {new:true} )
    }else{
        post = await postModel.findByIdAndUpdate(req.params.id ,{
            $push: {likes: req.user.id}
        }, {new:true} )
    }

    res.status(200).json(post)
})