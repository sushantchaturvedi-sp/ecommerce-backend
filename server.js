require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
// const path = require('path')
const cors = require('cors');
const errorHandler = require('./middleware/error.middleware');

const productRoutes = require('./routes/product.routes.js');

app.use(cors());

// // Load env vars
// dotenv.config();

// Database connection
const connectDB = require('./config/db');
connectDB();

// Route files
const auth = require('./routes/auth.routes');
const user = require('./routes/users.routes');

// Set EJS as templating engine

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//express.static('public'));
app.use(express.static('public'));

// Set static folder
// app.use(express.static(path.join(__dirname, 'public')));

// Logger
// if (process.env.NODE_ENV === 'development') {
app.use(morgan('dev'));
// }

// Mount route files
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', user);

app.use('/api/v1/products', productRoutes);

// ErrorHandler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server listening at ${PORT}`));
