const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv/config');

const app = express();
app.use(bodyParser.json());

// Import Routes
const authRoute = require('./routes/auth');

// Use Routes
app.use('/auth', authRoute);
app.use(cors());

// Connect to DB
mongoose.connect(
    process.env.DB_URI,
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: true },
    () => console.log('Connected to DB!')
);


// Listen to Server
app.listen(5000);
