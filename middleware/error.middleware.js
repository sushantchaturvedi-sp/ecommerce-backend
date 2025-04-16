const ErrorResponse = require('../utils/errorResponse.utils')

const errorHandler = (err, req, res, next) => {
    let error = { ...err }

    error.message = err.message
    
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        error.message = 'Resource not found'
    }

    // Mongoose Duplicate Key
    if (err.code === 11000) {
        error.message = 'Already exists'
    }

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        error.message = Object.values(err.errors).map(val => val.message)
    }

    console.log(error);
    res.status(error.statusCode || 500).json( {
        success: false,
        error: error.message || 'Server Error'
    })
    
}

module.exports = errorHandler;