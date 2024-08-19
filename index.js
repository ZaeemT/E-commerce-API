require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose")

const userRoutes = require("./routes/userRoutes")

const app = express();

// middleware
app.use(express.json())

app.use((req, res, next) => {
	console.log(req.path, req.method);
	next();
})

app.get("/", (req, res) => {
  	res.send("Hello World!");
});

app.use('/api/user', userRoutes)

// connect to db
mongoose.connect(process.env.MONG_URI)
    .then(() => {
        // Listen for requests
        app.listen(process.env.PORT, () => {
            console.log('Connected to db & Listening on port 3000')
        })
    })
    .catch((error) => {
        console.log(error)
    });