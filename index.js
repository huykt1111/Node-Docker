const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const redis= require("redis");
const cors = require("cors");
let RedisStore = require('connect-redis')(session);

const { MONGO_USER, MONGO_PASSWORD, MONGO_IP, MONGO_PORT, SESSION_SECRET,REDIS_URL, REDIS_PORT } = require('./config/config');

let redisClient = redis.createClient({
    host: REDIS_URL,
    port: REDIS_PORT,
});

const postRoute = require('./routers/postRoutes');
const userRoute = require('./routers/userRoutes');

const app = express();

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;

const connectWithRetry = () => {
    mongoose
        .connect(mongoURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => console.log("Successfully connected to DB "))
        .catch((e) => {
            console.log(e)
            setTimeout(connectWithRetry, 5000)
        });
};

connectWithRetry();

app.enable("trust proxy");
app.use(cors({
    
}));

app.use(session({
    store: new RedisStore({client: redisClient}),
    secret: SESSION_SECRET,
    cookie: {
        secure: false,
        resave: false,
        saveUninitialized: false,
        httpOnly: true, 
        maxAge: 60000,
    },
}));

app.use(express.json());

app.get("/api/v1", (req, res) => {
    res.send("<h2>HI THERE!!!</h2>");
    console.log("yeah it ran");
});

// localhost:3000/api/v1/posts
app.use("/api/v1/posts", postRoute);    
app.use("/api/v1/users", userRoute);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`listening on port ${port}`));