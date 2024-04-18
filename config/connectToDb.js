const mongoose = require("mongoose")

module.exports = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connection To mongoDB (:");
    }catch(error){
        console.log("Failed Connection :(" , error);
    }
}