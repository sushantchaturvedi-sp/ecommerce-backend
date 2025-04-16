const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const path = require('path')
const errorHandler = require('./middleware/error.middleware')


// Load env vars
dotenv.config();

// Database connection
const connectDB = require('./config/db')
connectDB()

// Route files
const auth = require('./routes/auth.routes')
const user = require('./routes/users.routes')

const app = express();


// Set EJS as templating engine

app.use(express.json())
app.use(express.urlencoded({ extended: false }))


// Set static folder
// app.use(express.static(path.join(__dirname, 'public')));



// Logger
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

// Mount route files
app.use('/api/v1/auth', auth)
app.use('/api/v1/users', user)
// ErrorHandler
app.use(errorHandler)

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT,console.log(`Server listening at ${PORT}`))