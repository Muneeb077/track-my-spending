const User = require("../models/user")
const jwt = require("jsonwebtoken");

//Generate JWT token
const generateToken = (id) => {
    return jwt.sign({id},process.env.JWT_SECRET, {expiresIn: "1h"});
};

exports.registerUser = async (req, res) => {
    const {fullName, email, password, profileImageUrl} = req.body;

    // Check for missing information
    if (!fullName || !email || !password) {
        return res.status(400).json({message: "All fields are required"});
    };

    // Chck if the email is exists, if not then try to register the user
    try{
        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(400).json({message: "Email already exists"});
        };

        const user = await User.create({
            fullName,
            email,
            password,
            profileImageUrl,
        });

        res.status(201).json({
            id: user._id,
            user,
            token: generateToken(user._id),
        });
    }catch (err) {
        res.status(500).json({message: 'Registering new user unsuccessful', error: err.message});
    }
};

exports.loginUser = async (req, res) => {
    const {email, password} = req.body;

    if (!email || !password) {
        return res.status(400).json({message: "All fields are required."})
    }
    try{
        const user = await User.findOne({email});
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({message: "Invalid credentials"})
        }

        res.status(200).json({
            id: user._id,
            user,
            token: generateToken(user._id),
        });
    }catch(err){
        return res.status(500).json({message: "Login Unsuccessful", error: err.message})
    }
};

exports.getuserInfo = async (req, res) => {
    try{
        const user = await User.findById(req.user.id).select("-password");

        if (!user){
            return res.status(404).json({message: 'User not found'});
        }

        res.status(200).json(user);
    }catch (err) {
        return res.status(500).json({message: "User Info fetch unsuccessful", error: err.message});
    }
};