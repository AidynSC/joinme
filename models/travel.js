const mongoose = require('mongoose');

const travelSchema = new mongoose.Schema({
    requested: String,
    origin: String,
    destination: String,
    date: Date,
    changes: Number,
    cost: Number,
});

module.exports = {
    travelSchema,
    Travel: mongoose.model('Travel', travelSchema)
};
