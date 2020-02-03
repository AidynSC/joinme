const mongoose = require('mongoose');
const { travelSchema } = require('./travel');

const userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    travels: [travelSchema]
});

module.exports = {
    userSchema,
    User: mongoose.model('User', userSchema)
};
