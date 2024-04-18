const express = require("express")
const connectToDb = require("./config/connectToDb");
const { errorHandler, notFound } = require("./middlewares/error");
require("dotenv").config()

// connection to database
connectToDb()

const app = express();

// Middlewares
app.use(express.json())


// Routes
app.use("/api/auth" , require("./routes/authRoute"))
app.use("/api/users" , require("./routes/usersRoute"))
app.use("/api/posts" , require("./routes/postRoute"))
app.use("/api/comments" , require("./routes/commentRoute"))
app.use("/api/categories" , require("./routes/categoryRoute"))
 

app.use(notFound)
app.use(errorHandler)


// Running the server
const port = process.env.PORT || 8000

app.listen(port , ()=> console.log(`server is work in port ${port}`))