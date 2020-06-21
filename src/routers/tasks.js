const express = require('express')
const tasksRouter = new express.Router()
const Task = require('../models/task')
const auth = require('../middleware/auth')

tasksRouter.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({_id: req.params.id, master: req.user._id})

        if(!task) return res.status(400).send({error: 'not found!'})

        res.send({completed: 'true'})
    } catch (e) {
        res.status(500).send(e)
    }
})

tasksRouter.post('/tasks', auth, async (req, res) => {
    console.log('--------------tasks-------------\n')
    const task = new Task({
        ...req.body,
        master: req.user._id
    })
    if(!task) console.log(task)
    try {
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

tasksRouter.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if(req.query.completed) { 
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        //const result = await Task.find({ master: req.user._id }) //works
        await req.user.populate({
            path: 'tasks',
            match, 
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
                // : {
                //     //createdAt: -1
                //     completed: 1
                // }
            }
        }).execPopulate()

        res.send(req.user.tasks)
    } catch (err) {
        res.status(404).send(err)
        console.log(err)
    }
})

tasksRouter.get('/tasks/:id', auth, async (req, res) => {
    console.log('task id: passed')
    const _id = req.params.id
    console.log('id', req.user._id)
    try {
        const task = await Task.findOne({ _id, master: req.user._id })
        console.log('---------TASK---------\n', task)
        if(!task) {
            return res.status(404).send('Not found')
        }

        res.send(task)
    } catch (e) {
        res.status(500).send(e)
        console.log(e)
    }
})

tasksRouter.patch('/tasks/:id', auth, async (req, res) => {
    console.log('patch')
    const validFields = ['description', 'completed']
    const update = Object.keys(req.body)
    const isValid = update.every((field) => {
        return validFields.includes(field)
    })
    // console.log('-----------PATCH----------\n',req.user)

    if(!isValid) return res.status(400).send({ error: 'Invalid field!'})


    try {
        const task = await Task.findOne({ _id: req.params.id, master: req.user._id })
        //const task = await Task.findById(req.params.id)

        if(!task) return res.status(404).send()

        update.forEach((update) => task[update] = req.body[update])

        await task.save()

        res.send(task)
    } catch (e) {
        res.status(400).send(e)
        console.log(e)
    }
})

module.exports = tasksRouter