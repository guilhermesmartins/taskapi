const express = require('express')

require('./db/mongoose')

const routerUsers = require('./routers/users')
const tasksRouter = require('./routers/tasks')

const app = express()
const port = process.env.PORT || 4000

app.use(express.json()) //convert json to object 

app.use(routerUsers)
app.use(tasksRouter)

app.listen(port, () => {
    console.log('Server is on port ' + port)
})