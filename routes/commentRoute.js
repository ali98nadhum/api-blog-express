const { createComment, getAllComment, deleteComment, updateComment } = require("../controllers/commentControllers");
const validateId = require("../middlewares/validateId");
const { verifyToken, verifyTokenAndAdmin } = require("../middlewares/verifyToken");
const router = require("express").Router();


router.route("/")
.post(verifyToken , createComment)
.get(verifyTokenAndAdmin , getAllComment)

router.route("/:id")
.delete(validateId , verifyToken , deleteComment)
.put(validateId , verifyToken , updateComment)

module.exports = router;