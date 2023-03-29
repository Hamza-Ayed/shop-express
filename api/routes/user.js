const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const UserModel = require('../models/user');
const jwt=require('jsonwebtoken');
// User signup
router.post('/signup', async (req, res, next) => {
    try {
        const {name, email, password} = req.body;

        // Check if user with same email already exists
        const existingUser = await UserModel.findOne({email: email});
        if (existingUser) {
            return res.status(409).json({message: 'Email already exists'});
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new UserModel({
            _id: new mongoose.Types.ObjectId(),
            name: name,
            email: email,
            password: hashedPassword
        });

        // Save the user to the database
        const savedUser = await newUser.save();

        res.status(201).json({
            message: 'User created successfully',
            user: {
                _id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
});


// Get all users
router.get('/', (req, res, next) => {
    UserModel.find().select('_id name email password').lean().exec()
        .then((users) => {
            if (users.length >= 0) {
                const count = users.length;
                res.status(200).json({
                    count: count,
                    users: users.map(user => {
                        return {
                            _id: user._id,
                            name: user.name,
                            email: user.email,
//                            password:user.password,
                            request: {
                                type: "GET",
                                url: `${process.env.BASE_URL}users/${user._id}`
                            }
                        }
                    })
                });
            } else {
                res.status(404).json({message: 'No users found'});
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({message: 'Server error'});
        });
});


// User signin
router.post('/signin', async (req, res, next) => {
    try {
        const {email, password} = req.body;

        // Check if user with email exists
        const user = await UserModel.findOne({email: email});
        if (!user) {
            return res.status(401).json({message: 'Authentication failed'});
        }

        // Compare the password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({message: 'Authentication failed'});
        }

        // Create a JWT token
        const token = jwt.sign(
            {userId: user._id, email: user.email},
            process.env.JWT_KEY,
            {expiresIn: '15m'}
        );

        res.status(200).json({
            message: 'Authentication successful',
            token: token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
});

module.exports = router;