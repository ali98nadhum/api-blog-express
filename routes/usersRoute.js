const router = require("express").Router()
const { getAllUsers, getUserProfile, updateUserProfile, getUsersCount, profilePhotoUpload, deleteUserProfile } = require("../controllers/userControllers")
const photoUpload = require("../middlewares/photoUpload")
const validateId = require("../middlewares/validateId")
const { verifyTokenAndAdmin, verifyTokenAndOnlyUser, verifyToken, verifyTokenAndAuthorizaton } = require("../middlewares/verifyToken")

//  /api/users/profile
router.route("/profile").get(verifyTokenAndAdmin , getAllUsers)

// /api/users/profile/:id
router.route("/profile/:id")
.get(validateId , getUserProfile)
.put(validateId , verifyTokenAndOnlyUser , updateUserProfile)
.delete(validateId , verifyTokenAndAuthorizaton , deleteUserProfile)

//  /api/users/profile/profile-photo-upload
router.route("/profile/profile-photo-upload").post(verifyToken , photoUpload.single("image") , profilePhotoUpload)

// /api/users/count
router.route("/count").get(verifyTokenAndAdmin , getUsersCount)

module.exports = router