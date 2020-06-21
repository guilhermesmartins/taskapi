const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')
const sharp = require('sharp')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)) throw new Error('Email is invalid!')
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if(value < 0) {
                throw new Error('age must be a positive number')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if(value.length < 6) {
                throw new Error('min 6 char')
            }
            else if(value.toLowerCase().includes('password')) {
                throw new Error('password cant be password duh')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true //track creation and updates of the user    
})

userSchema.virtual('tasks', {  //just a way to relate the things
    ref: 'tasks',
    localField: '_id',
    foreignField: 'master' //name of the field outside 
})

//statics for User and methods for user
userSchema.statics.findByCredentials = async (email, password) => { //creating a method
    console.log('findbycredentials')

    const user = await User.findOne({email})

    if(!user) {
        throw new Error('Unable to login!')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch) {
        throw new Error('Unable to login!')
    }

    return user
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })
    
    await user.save()
    
    return token
}

userSchema.pre('save', async function(next) { //before something
    const user = this //doc who will be saved

    if(user.isModified('password')) user.password = await bcrypt.hash(user.password, 8)

    next()
}) 

//Delete user tasks when user is removed
userSchema.pre('remove', async function(next) {
    const user = this
    await Task.deleteMany({ master: user._id })
    next()
})

const User = mongoose.model('user', userSchema)

module.exports = User