const router = require("express").Router()
const { createNewPost, getAllPost, getSingelPost, getPostCount, deletePost, updatePost, updatePostImage, toggleLike } = require("../controllers/postControllers")
const photoUpload = require("../middlewares/photoUpload")
const validateId = require("../middlewares/validateId")
const {verifyToken} = require("../middlewares/verifyToken")



router.route('/')
.post(verifyToken ,photoUpload.single("image") ,createNewPost)
.get(getAllPost)

router.route("/count")
.get(getPostCount)

router.route("/:id")
.get(validateId , getSingelPost)
.delete(validateId , verifyToken , deletePost)
.put(validateId , verifyToken , updatePost)

router.route("/update-image/:id")
.put(validateId , verifyToken , photoUpload.single("image") , updatePostImage)


router.route("/likes/:id").put(validateId , verifyToken , toggleLike)


module.exports = router