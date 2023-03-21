require("dotenv").config();

const express = require("express");
const app = express();
const PORT = process.env.PORT || 8006;
const cors = require("cors");
const morgan = require("morgan");
const path = require('path');
const router = require("./routes/router");
const cookieParser = require("cookie-parser");
const connectDB = require("./db/connect");


// middleware
app.use(express.json())
app.use(cookieParser(""));
app.use(cors());
app.use(morgan("dev"));
app.use(router);


// app.get("/", (req, res) => {
//     res.send("Hi! I am Omprakash Live")
// });

//static files
app.use(express.static(path.join(__dirname, "./client/build")));

app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

const start = async () => {
    try {
        await connectDB(process.env.MONGODB_URL);

        app.listen(PORT, () => {
            console.log(`${PORT} Yes i am connected`);
        })
    } catch (error) {
        console.log(error);
    }
}
start();
