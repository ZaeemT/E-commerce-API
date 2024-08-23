const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const bcrypt = require('bcrypt')

const User = require('../models/userModel')

const createToken = (_id) => {
    return jwt.sign({_id}, process.env.SECRET, {expiresIn: '3d'})
}

const loginUser = async (req, res) => {
    const {email, password} = req.body

    try {
        const user = await User.login(email, password)

        // create token
        const token = createToken(user._id)
        res.status(200).json({email, token})
    } catch(error) {
        res.status(400).json({error: error.message})
    }

}

const signupUser = async (req, res) => {
    const {name, email, password, role} = req.body

    try {
        const user = await User.signup(name, email, password, role)

        // create token
        const token = createToken(user._id)

        res.status(200).json({email, token})
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

const forgotPassword = async(req, res) => {
    let user = await User.findOne({ email: req.body.email })
    if (!user) {
        return res.status(404).json({ message: 'There is no user with that email address.' })
    }

    const resetToken = crypto.randomBytes(20).toString('hex')
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    // Setting token expiration date that would be 10 mins
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000 

    user = await user.save({ validateBeforeSave: false })
    
    const resetUrl = `${req.protocol}://${req.get('host')}/api/user/resetPassword/${resetToken}`

    const message = `Forgot your password? Submit a request with your new password to: ${resetUrl}\nIf you didn't request this, please ignore this email.`;

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Your password reset token (valid for 10 minutes)',
            text: message,
        });
    
        res.status(200).json({
            message: 'Token sent to email!',
        });
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save({ validateBeforeSave: false });
        
        return res.status(500).json({ message: err.message });
    

        // return res.status(500).json({ message: 'There was an error sending the email. Try again later.' });
    }
}

const resetPassword = async(req, res) => {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    console.log('Received token:', req.params.token);
    console.log('Hashed received token:', hashedToken);
    
    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }, // Ensure token is not expired
    });

    if (!user) {
        return res.status(400).json({ message: 'Token is invalid or has expired.' })
    }

    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully!' });
}




module.exports = { signupUser, loginUser, forgotPassword, resetPassword }