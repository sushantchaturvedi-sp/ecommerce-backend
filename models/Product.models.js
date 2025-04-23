const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    description:{
        type: String,
    },
    images:{
        type: [String],         //URL
        required: false
    },
    
    price:{
        type: Number,
        required: true
    },
    category:{
        type: String,
 
        required: true
    },
    stock:{
        type: Number,
        default: 0,
        required: true
    },
    sku:{
        type: String,
        required: false
    },
    deletedOn:{
        type: Date
    },
   
}, {timestamps: true});

module.exports = mongoose.model('Product', productSchema);