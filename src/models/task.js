const mongoose = require('mongoose')

const taskSchema = mongoose.Schema({
    description: {
        type: String,
        trim: true,
        required: true
    },
    completed: {
        type: Boolean,
        optional: true,
        default: false
    },
    master: {
        type: mongoose.Schema.Types.ObjectId, //objectId
        required: true,
        ref: 'user'
    }
}, {
    timestamps: true
})

const Task = mongoose.model('tasks', taskSchema)

module.exports = Task