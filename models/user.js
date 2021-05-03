const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    groups_id: [String],
    groups_name: [String]
}, {timestamps: true, collection: 'users'});

const User = mongoose.model('userSchema', userSchema);

module.exports = User;