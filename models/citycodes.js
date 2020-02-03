const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
    name: {type: String, required: true},
    code: {type: String, required: true},
});

module.exports = {
    citySchema,
    City: mongoose.model('City', citySchema)
};
