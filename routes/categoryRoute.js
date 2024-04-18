const { createCategory, getAllCategory, deleteCategory } = require("../controllers/categoryControllers");
const validateId = require("../middlewares/validateId");
const { verifyTokenAndAdmin } = require("../middlewares/verifyToken");

const router = require("express").Router();



router.route("/")
.post(verifyTokenAndAdmin , createCategory)
.get(getAllCategory)


router.route("/:id").delete(validateId , verifyTokenAndAdmin , deleteCategory)


module.exports = router;