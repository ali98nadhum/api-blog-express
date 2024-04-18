const mongosse = require("mongoose")


// for check valid id
module.exports = (req , res , next)=>{
    if(!mongosse.Types.ObjectId.isValid(req.params.id)){
        return res.status(400).json({message: "invalid id"})
    }

    next()
}