var User = require('./models/User.js')
var jwt = require('jwt-simple')
var bcrypt = require('bcrypt-nodejs')
var express = require('express')
var router = express.Router()

router.post('/register', (req, res) => {
    var userData = req.body
    var user = new User(userData)
    user.save((err, result) => {
        if (err)
            console.log('error!', err)
        res.sendStatus(200)
    })
})
router.post('/login', async (req, res) => {
    var loginData = req.body
    var user = await User.findOne({ email: loginData.email })

    if (!user)
        return res.status(401).send({ message: 'Invalid email or password' })
    bcrypt.compare(loginData.pwd, user.pwd, (err, isMatch) => {
        if (!isMatch)
            return res.status(401).send({ message: 'Invalid email or password' })

        var payload = {sub: user._id}
        //sub stands for subject
        var token = jwt.encode(payload, 'secret123')
        res.status(200).send({ token })
    })
})
var auth = {
    router,
    checkAuthenticated: (req, res, next) => {
        if (!req.header('authorization'))
            return res.staus(401).send({ message: 'missing authorization header' })

        var token = req.header('authorization').split(' ')[1]
        console.log(token);
        var payload = jwt.decode(token, 'secret123')
        if (!payload)
            return res.staus(401).send({ message: 'auth header invalid' })
        req.userId = payload.sub

        next()
    }
}
module.exports = auth