const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    console.log('Passed in auth')
    try {
      const token = req.header('Authorization').replace('Bearer ', '')
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
      
      if(!user) console.log('user null')

      req.user = user
      req.token = token

      if(req.user && req.token) console.log('tudo certo')

      next()
      
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' })
    }
} 

module.exports = auth