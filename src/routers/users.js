const express = require('express')
const routerUsers = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const upload = require('../middleware/files')
const sharp = require('sharp')
const { sendWelcomeEmail, sendCancelEmail } = require('../emails/account')

routerUsers.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

routerUsers.post('/users/logout', auth, async (req, res) => {
    try {

        req.user.tokens = req.user.tokens.filter((token) => {
            // return token !== req.token
            if(token === req.token) delete token
        })

        await req.user.save()

        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
        console.log(e)
    }
})

routerUsers.post('/users/logallt', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send('Deslogged from everything!')
    } catch (e) {
        res.status(500).send()
    }
})

routerUsers.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)

        const token = await user.generateAuthToken()

        res.send({ user, token })
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

routerUsers.get('/users', async (req, res) => {
    try {
        const users = await User.find({})
        res.send(users)
    } catch (err) {
        res.status(500).send(err)
    }
})

routerUsers.post('/users', async (req, res) => {
    const user = new User(req.body)
    

    try {
        await user.save()

        sendWelcomeEmail(user.email, user.name)

        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send(error)   
    }
})

routerUsers.get('/users/:name', async (req, res) => {
    try {
        const user = await User.findOne({ name: req.params.name })

        if(!user) {
            return res.status(404).send()
        }

        res.send(user)
    } catch (err) {
        res.status(500).send(err)
    }
})

routerUsers.patch('/users/me', auth, async (req, res) => {

    const updates = Object.keys(req.body) //will return an object
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValid = updates.every((update) => { //return true or false
        return allowedUpdates.includes(update)
    })
    
    if(!isValid) {
        return res.status(400).send({ error: 'Invalid updates!'})
    }

    try {
        // const user = await User.findById(req.params.id)

        updates.forEach((update) => req.user[update] = req.body[update])

        await req.user.save()

        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

routerUsers.delete('/users/me', auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.user._id)

        // if(!user) {
        //     return res.status(404).send({error:'not found!'})
        // }

        sendCancelEmail(req.user.email, req.user.name)
        await req.user.remove() 
        res.send({completed: 'true'})
    } catch (e) {
        res.status(500).send(e)
        console.log(e)
    }
})

routerUsers.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer)
        .resize({width: 250, height: 250})
        .png()
        .toBuffer()
    try {
        req.user.avatar = buffer



        await req.user.save()
        res.send()
    } catch (e) {
        res.status().send()
    }
    res.status(200).send()
}, (err, req, res, next) => {
    //res.status(400).send({ error: error.message}) //dont work
})

routerUsers.delete('/users/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined

    await req.user.save()

    res.status(200).send()
    } catch (e) {
        res.status(500).send(e)
    }
})

routerUsers.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        
        if(!user || !user.avatar) {
            throw new Error('user or picture doesnt exist!')
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

module.exports = routerUsers