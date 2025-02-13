const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const User = require('./models/User');
const app = express();
const bcrypt = require('bcrypt');

const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");

// Set the port from environment variable or default to 3000
const port = process.env.PORT ? process.env.PORT : "3000";
const authController = require("./controllers/auth.js");

mongoose.connect(process.env.MONGODB_URI);
mongoose.set("debug", true);
mongoose.connection.on("connected", () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

// Middleware to parse URL-encoded data from forms
app.use(express.urlencoded({ extended: false }));
// Middleware for using HTTP verbs such as PUT or DELETE
app.use(methodOverride("_method"));
// Morgan for logging HTTP requests
app.use(morgan("dev"));


//routes
app.get("/", async (req, res) => {
    res.render("index.ejs");
});

const saltRounds = 10;
app.post("/users", async (req, res) => {
    const password = await bcrypt.hash('123', saltRounds);
    const user = await User.create({ username: "shon1", password: "12345" });
    res.json(user);
});

app.post('/login', async (req, res) => {
    const {username,password} = req.body;
    try {
        const user = await User.findOne({username});
        if (user === null) {
            res.send('no user');
            return;
        }
        if (!user) {
            return res.status(404, error, 'user not found')
        }
        // if (user.password === password) {
        const comparePassword = await bcrypt.compare(password, user.password);
        if (comparePassword) {
            res.send('ok');
        } else {
            res.send('wrong');
        }
        const isPwCorrect = await user.isCorrectPw({password});
        if (!isPwCorrect) {
            return res.status(401, {error: 'invalid credentials'})
        }
        return res.status(200, {message: 'login successful', user: {username}})
    } catch (err) {
        debug('error login user', err);
        return res.status(500, {error: 'server error'} )
    }
});

app.get("/secret", (req, res) => {
    res.send("secret");
});

app.listen(port, () => {
    console.log(`The express app is ready on port ${port}!`);
});
