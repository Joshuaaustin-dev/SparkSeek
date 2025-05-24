//load environment variables from .env
require('dotenv').config(); 
const express = require('express'); //Express framework to create server/handle routing
const mongoose = require('mongoose'); //Mongoose to interact with MongoDB in an object-oriented way

//Create express application instance
const app = express(); 

//Use port from env or 5000
const PORT = process.env.PORT || 5000;

//Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
}).then(() => console.log('MongoDB connected successfully!'))
.catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
})

//Route for GET requests defined in root URL '/'
// When root is visited message will send
app.get('/', (req, res) => {
    res.send('Server is running!');
});

//Start the express server listening on PORT 5000
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});