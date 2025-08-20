const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.protect = async (req, resizeBy, next) => {
    let token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({message: "Not authorized, no token"});

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
    } catch (err) {
        res.status(401).json({message: "Not authorized, token failed"})
    }
};
