const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { registerValidation, loginValidation } = require('../validation');

// Registration API
// route: /auth/register
// required-params: username, email, password
router.post('/register', (req, res) => {
    // Validate Data Before Creating New User
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    User.findOne({ email: req.body.email })
        .then((emailExists) => {
            // If Email is already registered
            if (emailExists) return res.status(400).send("Email already exists! Please Login.");
            // Hash Password
            bcrypt.genSalt(10).then((salt) => {
                bcrypt.hash(req.body.password, salt).then((hashedPassword) => {
                    // If everything is OK, Create User
                    const user = new User({
                        username: req.body.username,
                        email: req.body.email,
                        password: hashedPassword
                    });
                    // Save User
                    user.save()
                        .then((savedUser) => { res.send({ _id: savedUser._id, username: savedUser.username, email: savedUser.email }); })
                        .catch((err) => { res.status(400).send(err); });
                });
            });
        });
});

// Login API
// route: /auth/login
// required-params: email, password
router.post('/login', (req, res) => {
    // Validate Data Before Creating New User
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    User.findOne({ email: req.body.email })
        .then((user) => {
            // If Email is already registered
            if (!user) return res.status(400).send("Email not found, Please Register!");

            // Compare Password
            bcrypt.compare(req.body.password, user.password).then((passwordIsValid) => {
                if (!passwordIsValid) return res.status(400).send('Invalid Password');
                // Create and Assign a Token
                const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
                res.header('auth-token', token).send(token);
            });
        });
});

module.exports = router;
